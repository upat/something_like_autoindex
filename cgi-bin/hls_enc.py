#!/usr/bin/env python3
# coding: utf-8
import sys, json, os, urllib.parse, subprocess, cgi, cgitb

#
# CGIで動かす場合はcmdから動かすこと(Linux互換環境ではパーミッションの絡みで動かない)
# Linux環境の場合はこのファイルのに対してchmod 755を実行すること
#

# エラーをフック
cgitb.enable()

# 末尾区切り無しルートパス(任意の絶対パスでも可)
rootPath = os.getcwd()
# 作業ディレクトリの設定
tempDir = '/temp'
# .m3u8ファイル名
m3u8 = '/stream.m3u8'
# ffmpegのパス
ff_path = r'/usr/bin/ffmpeg'
# ffmpegのオプション
ff_opt = '" -f hls -hls_time 9 -hls_list_size 1000 -hls_segment_filename' + ' ' + rootPath + tempDir + '/mystream-%08d.ts -threads auto -c:a copy -c:v copy' + ' ' + rootPath + tempDir + m3u8
# フラグの設定
flag = 1

# 作業フォルダ内とlogファイルの削除
for rm_file in os.listdir(rootPath + tempDir):
	os.remove(rootPath + tempDir + '/' + rm_file)

# リクエストされたパス(相対) URL用に多バイト文字がエンコードされているのでデコードも行う
form = cgi.FieldStorage()
filePath = form.getfirst('url')
filePath = urllib.parse.unquote_plus(filePath)

# フルパスの生成
fullPath = rootPath + '/' + filePath
# ffmpegのオプション完成、win向けディレクトリパス記述へ変換
ff_opt = ff_path + ' ' + '-i' + ' "' + fullPath + ff_opt

# HLS配信用エンコ
flag = subprocess.run(ff_opt, shell=True).returncode

# JSONデータ生成(エンコード可否)
postJSONData = { 'm3u8' : tempDir + m3u8, 'flag' : flag }

print('Content-Type:application/json; charset=UTF-8\n')
print(json.dumps(postJSONData)) # JSONフォーマット化
