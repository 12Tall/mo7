import pywifi
from pywifi import const

def scan_wifi():
    wifi = pywifi.PyWiFi()
    iface = wifi.interfaces()[0]  # 默认第一个无线接口
    iface.scan()
    print("正在扫描，请稍等...")
    import time
    time.sleep(2)  # 扫描需要等待一会儿

    results = iface.scan_results()
    for network in results:
        ssid = network.ssid
        bssid = network.bssid
        signal = network.signal  # 信号强度
        print(f"SSID: {ssid}, BSSID: {bssid}, Signal: {signal} dBm")

scan_wifi()
