#!/usr/bin/env python3
import os
import json
import requests
import base64
import gzip
import UnityPy
#from dotenv import load_dotenv

#load_dotenv()

TITLE_ID = os.getenv('TITLE_ID')
GAME_VER = os.getenv('GAME_VER')
GC_AUTH_ID = os.getenv('GC_AUTH_ID')
GC_AUTH_ID = 'T:_d8bbe62950f4caae7d37a00dfa6c283f'
TITLE_ID = '8b9b7'
GAME_VER = '1.34.0'
REQUEST_URL = f"https://{TITLE_ID}.playfabapi.com/Client/LoginWithGameCenter"

# Stage I: config
with open('gc-auth-body.json', 'r') as f:
  GC_AUTH_BODY = json.load(f)
  GC_AUTH_BODY["PlayerId"] = GC_AUTH_ID
  GC_AUTH_BODY["TitleId"] = TITLE_ID.upper()

  for i, n in enumerate(GC_AUTH_BODY["InfoRequestParameters"]["TitleDataKeys"]):
    GC_AUTH_BODY["InfoRequestParameters"]["TitleDataKeys"][i] = n.replace('VERSION', GAME_VER)

# Stage II: get assetbundle manifest and lteschedule from PlayFab
r = requests.post(REQUEST_URL, json=GC_AUTH_BODY).json()
assetbundles = json.loads(r["data"]["InfoResultPayload"]["TitleData"][f"AssetBundleInfos_{GAME_VER}"])
lte_schedule = json.loads(gzip.decompress(base64.b64decode(r["data"]["InfoResultPayload"]["TitleData"][f"LteSchedule_{GAME_VER}"])).decode())
# write lte_schedule to file
with open('lte_schedule.json', 'w') as f:
  json.dump(lte_schedule, f)
assetbundles_domain = assetbundles["RemoteBundlesUrl"]
assetbundles_urls = []

for i in assetbundles["GameDataBundles"]:
  url = f"{assetbundles_domain}/{GAME_VER}/iOS/{i['CompiledBundleName']}_{i['Hash'][-1]}"
  assetbundles_urls.append(url)

assetbundles_fname = [(x.split('/')[-2], x.split('/')[-1]) for x in assetbundles_urls]

# Stage III: download individual assetbundles and export JSON
for i in assetbundles_urls:
  with requests.get(i) as r:
    with open(f"event/{i.split('/')[-1]}", 'wb') as f:
      f.write(r.content)

for i in assetbundles_fname:
  uab = UnityPy.load(f"event/{i[1]}")
  for obj in uab.objects:
    if obj.type.name == "TextAsset":
      data = obj.read()
      with open(f"event/event_{i[0]}.json", 'w') as f:
        f.write(data.text)

# Stage IV: delete assetbundles (as they are only temp)
for i in assetbundles_urls:
  os.remove(f"event/{i.split('/')[-1]}")