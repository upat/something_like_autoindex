# coding: utf-8
import sys, json, os, urllib.parse

#
# CGIで動かす場合はcmdから動かすこと(Linux互換環境ではパーミッションの絡みで動かない)
# Linux環境の場合はこのファイルのに対してchmod 755を実行すること
#

# 末尾区切り無しルートパス(任意の絶対パスでも可)
rootPath = os.getcwd()
# リクエストされたパス(相対) URL用に多バイト文字がエンコードされているのでデコードも行う
nowDir = sys.stdin.read()
nowDir = urllib.parse.unquote(nowDir)

if nowDir == '/': # 初回起動の場合
	fullPath = rootPath + nowDir
	nowDir = ''
else:
 	fullPath = rootPath + '/' + nowDir + '/'

# 親ディレクトリ
if nowDir.rfind('/') > 0:
	parDir = nowDir[0:nowDir.rfind('/')]
else:
	parDir = ''

dirNameArray = []  # フォルダ一覧を格納
fileNameArray = [] # ファイル一覧を格納

# 指定パスからファイル・フォルダの一覧を取得する
for i in os.listdir(fullPath):
	if os.path.isdir(fullPath + i):
		dirNameArray.append(i) # フォルダ一覧
	elif os.path.isfile(fullPath + i) and (fullPath + i).rfind('.mp4') > -1:
		fileNameArray.append(i) # ファイル一覧

# JSONデータ生成(現在のディレクトリ, ディレクトリ一覧, ファイル一覧)
postJSONData = { 'debug' : fullPath, 'parDir' : parDir, 'nowDir' : nowDir, 'dir' : dirNameArray, 'file' : fileNameArray }

print('Content-Type:application/json; charset=UTF-8\n')
print(json.dumps(postJSONData)) # JSONフォーマット化

