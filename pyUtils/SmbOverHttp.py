from io import BytesIO
import os
from typing import List
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import PlainTextResponse, StreamingResponse
from smb.SMBConnection import SMBConnection
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
import uvicorn
import configparser

# 创建解析器
config = configparser.ConfigParser()

# 读取 ini 文件
config.read('config.ini')

client_name = config.get("smb", "client_name")
server_name = config.get("smb", "server_name")
server_ip = config.get("smb", "server_ip")
domain = config.get("smb", "domain")
port = config.getint("smb", "port")

auth_key_name = config.get("app", "auth_key_name")
auth_key_value = config.get("app", "auth_key_value")
secret_key = config.get("app", "secret_key")
http_port = config.getint("app", "port")

print(server_ip)


class SMBClient(SMBConnection):
    def __init__(self, username, password, remote_name=server_name, my_name=client_name, domain=domain, use_ntlm_v2=True, sign_options=..., is_direct_tcp=False):
        super().__init__(username, password, my_name, remote_name, domain, use_ntlm_v2, sign_options, is_direct_tcp)        

    def connect(self, ip, port=139, sock_family=None, timeout=60):
        self.remote_ip = ip  
        self.remote_port = port
        self.sock_family = sock_family
        self.timeout = timeout
        return super().connect(ip, port, sock_family, timeout)

    def ensure_alive(self):
        try:
            self.listShares()
            return True
        except Exception:
            print("🔁 连接失效，尝试重连...")
            return self.connect(self.remote_ip, self.remote_port, self.sock_family, self.timeout)
        


class SMBPool():
    def __init__(self, key_name="smb_connection"):
        self.pool = {}
        self.key_name = key_name

    def get_smbclient_from_session(self, request: Request):
        key_name = request.session.get(self.key_name)
        if key_name:  
            smb_client:SMBClient = self.pool.get(key_name)
            if smb_client and smb_client.ensure_alive():
                return smb_client
            else:
                # 应对中间改密码的情况
                self.remove_smbclient_from_session(request)
        
        raise HTTPException(status_code=401, detail="用户未登录或者登录凭证过期！")

    def add_smbclient_to_session(self, request: Request, smb_client:SMBClient):
        self.pool[self.key_name] = smb_client
        request.session[self.key_name] = self.key_name

    
    def remove_smbclient_from_session(self, request: Request):
        key_name = request.session.get(self.key_name)
        if key_name:  
            smb_client:SMBClient = self.pool.get(key_name)
            if smb_client:
                smb_client.close()
                self.pool.pop(key_name)
                request.session.pop(self.key_name)


class CookieAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):          
        if request.url.path.startswith("/docs") or request.url.path in ["/openapi.json", ]:
            return await call_next(request)      
        token = request.cookies.get(auth_key_name)
        
        if token != auth_key_value:
            return PlainTextResponse("Hello Mo-7!")

        # 验证通过，继续处理请求
        return await call_next(request)


app = FastAPI()
app.add_middleware(CookieAuthMiddleware)
app.add_middleware(SessionMiddleware, secret_key=secret_key)
smb_pool = SMBPool()

@app.post('/login')
async def login(request: Request, account:str = Form(''), password:str=Form('')):
    if not account or not password:
        raise HTTPException(status_code=400, detail="账号或密码不能为空")
    smb_client = SMBClient(account, password, domain=domain)
    connected = smb_client.connect(server_ip, port)
    if not connected:  
        raise HTTPException(status_code=401, detail="账号或密码错误")
    smb_pool.add_smbclient_to_session(request,smb_client)
    return "ok!"

@app.get('/logout')
async def logout(request: Request):
    smb_pool.remove_smbclient_from_session(request)
    return "ok!"

@app.get('/shares')
async def list_shares(request: Request):
    smb_client:SMBClient = smb_pool.get_smbclient_from_session(request)
    return smb_client.listShares()

@app.get('/dir')
async def list_dir(request: Request, share:str, path:str):
    """📂 列目录"""
    smb_client:SMBClient = smb_pool.get_smbclient_from_session(request)
    try:
        return smb_client.listPath(share, path)
    except:
        raise HTTPException(400, "没有访问权限")

@app.get('/download')
async def download(request: Request, share:str, path:str):
    """📥 下载文件"""
    smb_client:SMBClient = smb_pool.get_smbclient_from_session(request)
    file_name = path.split("/")[-1]
    print(share, path)
    try:
        file_obj = BytesIO()
        smb_client.retrieveFile(share, path, file_obj)
        file_obj.seek(0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File download error: {str(e)}")

    return StreamingResponse(
        file_obj,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'}
    )


@app.post('/upload', description="📤 上传文件：如果上传多个文件或不须修改文件名，则不要填写filename")
async def upload(request: Request, share:str, path:str,files: List[UploadFile] = File(...), file_name:str = Form('')):
    smb_client:SMBClient = smb_pool.get_smbclient_from_session(request)    
    path = path.strip().replace("\\", "/").rstrip("/")
    # 如果看起来像文件（有后缀），取父目录
    if "." in os.path.basename(path):
        path = os.path.dirname(path).replace("\\", "/") or "/"
    else:
        path = path or "/"
    for file in files:
        file_obj = BytesIO(await file.read())
        try:
            smb_client.storeFile(share, os.path.join(path, file.filename if not file_name else file_name), file_obj=file_obj)
        except Exception as e:
            raise HTTPException(500, f"{e}")
    return smb_client.listPath(share, path)

@app.delete('/delete')
async def delete(request: Request, share:str, path:str):
    """❌ 删除文件"""
    smb_client:SMBClient = smb_pool.get_smbclient_from_session(request)    
    path = path.strip().replace("\\", "/").rstrip("/")
    # 如果看起来像文件（有后缀），取父目录
    try:
        smb_client.deleteFiles(share, path, delete_matching_folders=True)
        return smb_client.listPath(share, os.path.dirname(path))
    except Exception as e:
        raise HTTPException(400, f"无法删除该文件")

@app.post('/move')
@app.patch('/move')
async def move(request: Request, share:str, path:str, new_path:str=''):
    """🔁 重命名/移动"""
    smb_client:SMBClient = smb_pool.get_smbclient_from_session(request)   
    try:
        if not new_path:
            new_path = path 
        smb_client.rename(share, path, new_path)
        return smb_client.listPath(share, os.path.dirname(path))
    except Exception as e:
        raise HTTPException(400, f"无法移动该文件")


@app.get('/mkdir')
async def make_dir(request: Request, share:str, path:str):
    """📁 创建目录"""
    smb_client:SMBClient = smb_pool.get_smbclient_from_session(request)   
    try:
        smb_client.createDirectory(share, path)
        return smb_client.listPath(share, os.path.dirname(path))
    except Exception as e:
        raise HTTPException(400, f"无法移动该文件")


if __name__ == "__main__":
    uvicorn.run(app, port=http_port)