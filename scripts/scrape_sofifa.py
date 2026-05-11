import requests
from bs4 import BeautifulSoup
import json
import time
import os

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

players = []
teams = {}

def parse_sofifa(pages=50):
    for offset in range(0, pages * 60, 60):
        url = f"https://sofifa.com/players?offset={offset}"
        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code != 200:
                print(f"Failed at offset {offset}, status: {resp.status_code}")
                break
            soup = BeautifulSoup(resp.text, 'lxml')
            tbody = soup.find('tbody')
            if not tbody:
                break
            
            rows = tbody.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) < 8:
                    continue
                
                # Name and Position
                name_cell = cols[1]
                name_a = name_cell.find_all('a')
                if len(name_a) < 1: continue
                full_name = name_cell.find('div', class_='bp3-text-overflow-ellipsis').text.strip() if name_cell.find('div', class_='bp3-text-overflow-ellipsis') else name_a[0].text.strip()
                short_name = name_a[0].text.strip()
                
                # Try to get positions
                pos_tags = name_cell.find_all('span', class_='pos')
                positions = [p.text for p in pos_tags]
                primary_pos = positions[0] if positions else 'MEI'
                
                # Age
                try:
                    age_text = cols[2].text.strip().split()[0]
                    age = int(age_text)
                except:
                    age = 22
                
                # OVR and POT
                try:
                    ovr_text = cols[3].text.strip().split()[0]
                    ovr = int(ovr_text)
                except:
                    ovr = 70
                    
                try:
                    pot_text = cols[4].text.strip().split()[0]
                    pot = int(pot_text)
                except:
                    pot = 75
                
                # Team
                team_cell = cols[5]
                team_a = team_cell.find('a')
                team_name = team_a.text.strip() if team_a else "Free Agent"
                
                if team_name not in teams and team_name != "Free Agent":
                    teams[team_name] = {"name": team_name, "league": "World", "tier": 1}
                
                players.append({
                    "name": full_name,
                    "shortName": short_name,
                    "age": age,
                    "position": primary_pos,
                    "ovr": ovr,
                    "pot": pot,
                    "team": team_name
                })
            
            print(f"Scraped offset {offset}... Total players so far: {len(players)}")
            time.sleep(0.5) # respectful delay
            
        except Exception as e:
            print(f"Error scraping offset {offset}: {e}")
            break

print("Starting SoFIFA scrape...")
parse_sofifa(50)

# Save to src/data
os.makedirs('src/data', exist_ok=True)
with open('src/data/realPlayers.json', 'w', encoding='utf-8') as f:
    json.dump(players, f, ensure_ascii=False, indent=2)

# Format teams into an array
teams_list = list(teams.values())
# Estimate tier based on average OVR of players in that team
team_ovr_sum = {t: 0 for t in teams.keys()}
team_count = {t: 0 for t in teams.keys()}

for p in players:
    t = p['team']
    if t in team_ovr_sum:
        team_ovr_sum[t] += p['ovr']
        team_count[t] += 1

for t in teams_list:
    name = t['name']
    avg_ovr = team_ovr_sum[name] / team_count[name] if team_count[name] > 0 else 70
    if avg_ovr >= 82: t['tier'] = 1
    elif avg_ovr >= 77: t['tier'] = 2
    elif avg_ovr >= 72: t['tier'] = 3
    else: t['tier'] = 4

with open('src/data/realTeams.json', 'w', encoding='utf-8') as f:
    json.dump(teams_list, f, ensure_ascii=False, indent=2)

print(f"Done. Saved {len(players)} players and {len(teams_list)} teams.")
