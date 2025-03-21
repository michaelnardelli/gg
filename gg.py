import pyautogui
import time

# Ottenere la posizione attuale del mouse
x, y = pyautogui.position()

# Tempo di inizio
start_time = time.time()
duration = 2  # Durata in secondi

print(f"Autoclicker in esecuzione alle coordinate ({x}, {y})...")
while time.time() - start_time < duration:
    pyautogui.click(x, y)  # Effettua un click alle coordinate attuali del mouse
    time.sleep(0.01)  # Piccola pausa per non sovraccaricare il sistema

print("Autoclicker terminato.")