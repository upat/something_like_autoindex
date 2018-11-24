// cgi通信用に使用
d3.select('body')
	.append('form')
	.append('input')
	.attrs({
		'id' : 'url',
		'readonly' : ''
	});

// リンク表示領域の設置 
d3.select('body')
	.append('div')
	.attrs({
		id : 'link_area'
	});
// 現在のディレクトリ名(初期値root)
let dir_data = '0';
d3.select('#link_area')
	.append('p').attr('class', 'link_text')
	.append('p').attrs({
		'id'    : '0',
		'title' : '/'	
	});
// ディレクトリ内の一覧を取得(初回)
display_dir(dir_data);

function display_dir(dir_name){
	// cgi用の要素へ値を入れる
	let title = $('#' + dir_name).attr('title');
	$('#url').val([title]);
	
	// cgi通信に使用する連番id付与カウンタ
	let id_cnt = 0;

	// 既に表示されている一覧のクリア
	d3.selectAll('.link_text').remove();
	d3.select('video').remove();

	// pythonと通信を行いディレクトリ内の要素一覧を受け取る
	$.ajax({
		type     : 'POST',
		url      : '/cgi-bin/get_dir.py',
		data     : {url : $('#url').val()},
		dataType : 'text',
	}).done(function(data){
		try{
			data = $.parseJSON(data); // 文字列で返ってきたJSONデータをJSON化
		}catch(e){
			console.log(e);
			return;
		}

		// 現在のパスの更新
		dir_name = data.nowDir;
		if(dir_name != ''){
			dir_name = dir_name + '/';
		}

		// titleタグへ現在のディレクトリ名を反映
		document.title = decodeURI(title);

		// ディレクトリ一覧の出力
		if(data.dir instanceof Array){
			
			// ルートへ戻るリンク(root時は生成しない)
			if(data.nowDir != ''){
				d3.select('#link_area')
					.append('p').attr('class', 'link_text')
					.append('a')
					.attrs({
						'href'    : 'javascript:void(0);',
						'onclick' : "display_dir('" + id_cnt + "');",
						'id'      : id_cnt,
						'title'   : '/'
					})
					.text('/');
				id_cnt++; // インクリメント
			}

			// ひとつ上のディレクトリへ戻るリンク(ひとつ上がrootの場合は生成しない)
			if(data.parDir != ''){
				d3.select('#link_area')
					.append('p').attr('class', 'link_text')
					.append('a')
					.attrs({
						'href'    : 'javascript:void(0);',
						'onclick' : 'display_dir("' + id_cnt + '");',
						'id'      : id_cnt,
						'title'   : encodeURI(data.parDir)
					})
					.text('../');
				id_cnt++; // インクリメント
			}

			// ディレクトリ内のフォルダ一覧の出力
			data.dir.forEach(function(d){
				d3.select('#link_area')
					.append('p').attr('class', 'link_text')
					.append('a')
					.attrs({
						'href'    : 'javascript:void(0);',
						'onclick' : 'display_dir("' + id_cnt + '");',
						'id'      : id_cnt,
						'title'   : encodeURI(dir_name + d)
					})
					.text(d + '/');
				id_cnt++; // インクリメント
			});
		}
		
		// ファイル一覧の出力(ここからonclick先を別関数にしたい)
		if(data.file instanceof Array){
			data.file.forEach(function(d){
				d3.select('#link_area')
					.append('p').attr('class', 'link_text')
					.append('a')
					.attrs({
						'href'    : 'javascript:void(0);',
						'onclick' : 'display_file("' + id_cnt + '","' + data.nowDir + '");',
						'id'      : id_cnt,
						'title'   : encodeURI(dir_name + d)
					})
					.text(d);
				id_cnt++; // インクリメント
			});
		}
	});
}

// ファイル展開ページの生成
function display_file(filename, path){
	// cgi用の要素へ値を入れる
	let title = $('#' + filename).attr('title');
	$('#url').val([title]);
	
	// 既に表示されている一覧のクリア
	d3.selectAll('.link_text').remove();
	d3.selectAll('video').remove();
	// cgi通信に使用する連番id付与カウンタ
	let id_cnt = 0;

	// titleタグへ現在のディレクトリ名を反映
	document.title = decodeURI(title);

	// ルートへ戻るリンク
	d3.select('#link_area')
		.append('p').attr('class', 'link_text')
		.append('a')
		.attrs({
			'href'    : 'javascript:void(0);',
			'onclick' : "display_dir(" + id_cnt + ");",
			'id'      : id_cnt,
			'title'   : '/'
		})
		.text('/');
	id_cnt++; // インクリメント

	// ひとつ上のディレクトリへ戻るリンク
	d3.select('#link_area')
		.append('p').attr('class', 'link_text')
		.append('a')
		.attrs({
			'href'  : 'javascript:void(0);',
			'onclick' : 'display_dir("' + id_cnt + '");',
			'id'      : id_cnt,
			'title'   : encodeURI(path)
		})
		.text('../');
	id_cnt++; // インクリメント

	// ファイル表示（動画）
	d3.select('#link_area')
		.append('video')
		.attrs({
			'class'    : 'video-js',
			'controls' : '',
			'data-setup' : '{}',
			'width'    : '640',
			'height'   : '360'
		})
		.append('source')
		.attrs({
			'src'  : title,
			'type' : 'application/x-mpegURL'
	});
}
