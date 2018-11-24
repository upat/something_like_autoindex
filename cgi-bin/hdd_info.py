#!/usr/bin/env python3
# coding: utf-8
import subprocess, re, shutil, json, os

def smart():
	try:
		# smartmontoolsよりHDD温度情報の取得
		smartctl = subprocess.check_output( 'sudo smartctl -a /dev/sda2 -d sat', shell=True )
		smartctl = smartctl.decode( 'utf-8' ).split( '\n' )
		
		# 代替処理済のセクタ数の数値のみトリミング
		rs_ct = [ x for x in smartctl if x.startswith( '  5 Reallocated_Sector_Ct' ) ]
		rs_ct = re.sub( ' ', '', rs_ct[0][-3:] )

		# HDD温度情報の数値のみトリミング
		temp = [ x for x in smartctl if x.startswith( '194 Temperature_Celsius' ) ]
		temp = re.sub( ' ', '', temp[0][-3:] )
		
		# 代替処理保留中のセクタ数の数値のみトリミング
		cps = [ x for x in smartctl if x.startswith( '197 Current_Pending_Sector' ) ]
		cps = re.sub( ' ', '', cps[0][-3:] )
		
		# エラー無し
		err = '0'
	except:
		rs_ct = '0'
		temp  = '0'
		cps   = '0'
		
		# エラー有り
		err   = '1'
	
	data = { 'rs_ct' : rs_ct, 'temp' : temp, 'cps' : cps, 'err' : err }
	
	return data
	
def disk_free():
	# 容量を取得したいストレージのパス(ディレクトリが異なる場合は固定値をセットすること)
	hdd_path = os.getcwd()
	
	try:
		# HDDの全容量
		total = shutil.disk_usage( hdd_path ).total
		total = round( total / ( 1024 * 1024 * 1024 ), 1 )
		total = str( total )
		
		# HDDの空き容量
		free = shutil.disk_usage( hdd_path ).free
		free = round( free / ( 1024 * 1024 * 1024 ), 1 )
		free = str( free )
		
		# エラー無し
		err = '0'
	except:
		total = str( 0 )
		free  = str( 0 )
		
		# エラー有り
		err = '1'
	
	data = { 'total' : total, 'free' : free, 'err' : err }
	
	return data

# 各データの取得	
smart_data = dict( smart() )
disk_free_data = dict( disk_free() )

# 取得したデータの結合
post_data = dict( smart_data )
post_data.update( disk_free_data )

# エラー検出
if smart_data[ 'err' ] != '0' or disk_free_data[ 'err' ] != '0':
	post_data.update( err = '1' )
else:
	post_data.update( err = '0' )

# POST
print( 'Content-Type:application/json; charset=UTF-8\n' )
print( json.dumps( post_data ) ) # JSONフォーマット化
