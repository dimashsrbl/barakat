import subprocess

import serial
from serial.tools import list_ports


def close_ports():
    ports = list_ports.comports()
    for port in ports:
        try:
            ser = serial.Serial(port.device)
            ser.close()
            print(f"Порт {port.device} закрыт.")
        except Exception as e:
            print(f"Не удалось закрыть порт {port.device}: {e}")


def free_com_port(port):
    script = f"""
    $port = "{port}"
    Get-WmiObject Win32_SerialPort | Where-Object {{ $_.DeviceID -eq $port }} | ForEach-Object {{
        $processId = $_.PNPDeviceID -replace ".*PID_", ""
        Stop-Process -Id $processId -Force
    }}
    """
    subprocess.run(["powershell", "-Command", script], shell=True)
