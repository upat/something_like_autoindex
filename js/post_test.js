// リンク表示領域の設置 
d3.select('body')
	.append('div')
	.attrs({
		id : 'link_area'
	});
// 現在のディレクトリ名(初期値root)
let dir_data = '/';
// ディレクトリ内の一覧を取得(初回)
display_dir(dir_data);

function display_dir(dir_name){
	// 既に表示されている一覧のクリア
	d3.selectAll('.link_text').remove();
	d3.select('video').remove();
	console.log(dir_name);

	// pythonと通信を行いディレクトリ内の要素一覧を受け取る
	$.ajax({
		type     : 'POST',
		url      : '/cgi-bin/get_dir.py',
		data     : String(dir_name),
		dataType : 'text'
	}).done(function(data){
		try{
			data = $.parseJSON(data); // 文字列で返ってきたJSONデータをJSON化
		}catch(e){
			console.log(e);
			return;
		}

		console.log(data);
		console.log(data.debug);

		// 現在のパスの更新
		dir_name = data.nowDir;
		if(dir_name != ''){
			dir_name = dir_name + '/';
		}

		// titleタグへ現在のディレクトリ名を反映
		document.title = dir_name;

		// ディレクトリ一覧の出力
		if(data.dir instanceof Array){
			
			// ルートへ戻るリンク(root時は生成しない)
			if(data.nowDir != ''){
				d3.select('#link_area')
					.append('p').attr('class', 'link_text')
					.append('a')
					.attrs({
						'href'    : 'javascript:void(0);',
						'onclick' : "display_dir('/');"
					})
					.text('/');
			}

			// ひとつ上のディレクトリへ戻るリンク(ひとつ上がrootの場合は生成しない)
			if(data.parDir != ''){
				d3.select('#link_area')
					.append('p').attr('class', 'link_text')
					.append('a')
					.attrs({
						'href'    : 'javascript:void(0);',
						'onclick' : 'display_dir("' + encodeURI(data.parDir) + '");'
					})
					.text('../');
			}

			// ディレクトリ内のフォルダ一覧の出力
			data.dir.forEach(function(d){
				d3.select('#link_area')
					.append('p').attr('class', 'link_text')
					.append('a')
					.attrs({
						'href'    : 'javascript:void(0);',
						'onclick' : 'display_dir("' + encodeURI(dir_name + d) + '");'
					})
					.text(d + '/');
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
						'onclick' : 'display_file("' + encodeURI(dir_name + d) + '","' + data.nowDir + '");'
					})
					.text(d);
			});
		}
	});
}

// ファイル展開ページの生成
function display_file(filename, path){
	// pythonと通信を行いディレクトリ内の要素一覧を受け取る
	$.ajax({
		type     : 'POST',
		url      : '/cgi-bin/hls_enc.py',
		data     : String(filename),
		dataType : 'text'
	}).done(function(data){
		try{
			data = $.parseJSON(data); // 文字列で返ってきたJSONデータをJSON化
		}catch(e){
			console.log(e);
			return;
		}
	
		// 既に表示されている一覧のクリア
		d3.selectAll('.link_text').remove();
		d3.selectAll('video').remove();

		// titleタグへ現在のディレクトリ名を反映
		document.title = filename;

		// ルートへ戻るリンク
		d3.select('#link_area')
			.append('p').attr('class', 'link_text')
			.append('a')
			.attrs({
				'href'    : 'javascript:void(0);',
				'onclick' : "display_dir('/');"
			})
			.text('/');

		// ひとつ上のディレクトリへ戻るリンク
		d3.select('#link_area')
			.append('p').attr('class', 'link_text')
			.append('a')
			.attrs({
				'href'  : 'javascript:void(0);',
				'onclick' : 'display_dir("' + encodeURI(path) + '");'
			})
			.text('../');

		console.log(data.flag);
		console.log(data.debug);

		if(!data.flag){
			// ファイル表示（動画）
			d3.select('#link_area')
				.append('video')
				.attrs({
					'class'    : 'video-js',
					'controls' : '',
					'data-setup' : '{}',
					'width'    : '320',
					'height'   : '180'
				})
				.append('source')
				.attrs({
					'src'  : data.m3u8,
					'type' : 'application/x-mpegURL'
			});
		}
	});
}
