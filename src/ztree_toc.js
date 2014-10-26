/**
 * 1.1.1 = 1*100*100 + 1*100 + 1
 * 1.2.2 = 1*100*100 + 2*100 + 3
 *
 * 1 = 0*100 +1
 */
function encode_id_with_array(opts,arr) {
	var result = 0;
	for(var z = 0; z < arr.length; z++ ) {
		result += factor(opts, arr.length - z ,arr[z]);
	}

	return result;
}


/**
 * 1.1.1 = 1*100*100 + 1*100 + 1
 * 1.2.2 = 1*100*100 + 2*100 + 3
 *
 * 1 = 0*100 +1

   1,1 = 100

 */
function get_parent_id_with_array(opts,arr) {
	// var result_arr = arr.slice(0);//副本
	var result_arr = [];
	for(var z = 0; z < arr.length; z++ ) {
		result_arr.push(arr[z]);
	}

	var result;
	do{
		result_arr.pop();
		result=0;
		
		for(var z = 0; z < result_arr.length; z++ ) {
			result += factor(opts,result_arr.length - z,result_arr[z]);
		}
	}while(!hasNode(opts,result) && result_arr.length);
	//确认计算出的父节点id是否真的存在,若不存在向上追溯

	return result;
}
//确认id的节点是否存在 (对于不规则章节的部分处理, 例如直接从h2开始写)
function hasNode(opts,id){
	var arr=opts._header_nodes;
	for(var i=0;i<arr.length;i++){
		if(arr[i].id==id)return true;
	}
	return false;
}
function factor(opts ,count,current) {
	if(1 == count) {
		return current;
	}
	//原来这里存在逻辑bug, 只是轻轻的改了一下
	//不过这里直接改用 数值计算 比 字符串拼接eval更好吧.
	var str = 'current * ';
	for(var i = count - 1;i > 0; i-- ) {
		str +=  opts.step+'*';
	}

	return eval( str + '1' );
}

;(function($) {
	/*
	 * 根据header创建目录内容
	 */
	function create_toc(opts) {
		$(opts.documment_selector).find(':header').each(function() {
			var level = parseInt(this.nodeName.substring(1), 10);

			_rename_header_content(opts,this,level);
			//console.log(this);
			//console.log('headers:'+opts._headers);
			_add_header_node(opts,$(this));
		});//end each
	}

	/*
	 * 渲染ztree
	 */
	function render_with_ztree(opts) {
		var t = $(opts._zTree);
		t = $.fn.zTree.init(t,opts.ztreeSetting,opts._header_nodes).expandAll(opts.is_expand_all);
		// alert(opts._headers * 88);
		// $(opts._zTree).height(opts._headers  * 33 + 33);

		if(opts.is_posion_top == true){
			opts.ztreeStyle.top = '0px';

			if( opts.ztreeStyle.hasOwnProperty('bottom') )
				delete opts.ztreeStyle.bottom ;
		}else{
			opts.ztreeStyle.bottom = '0px';

			if( opts.ztreeStyle.hasOwnProperty('top') )
				delete opts.ztreeStyle.top;
		}

		$(opts._zTree).css(opts.ztreeStyle);
	}

	/*
	 * 将已有header编号，并重命名
	 */
	function _rename_header_content(opts ,header_obj ,level) {
		//_headrs[] 存储各级标题的序号, 然后连成 1.1.2  形式
		if(opts._headers.length == level) {
			opts._headers[level - 1]++;
		} else if(opts._headers.length > level) {
			opts._headers = opts._headers.slice(0, level);
			opts._headers[level - 1] ++;
		} else if(opts._headers.length < level) {
			//for(var i = 0; i < (level - opts._headers.length); i++) {
			while(opts._headers.length < level){
				// console.log('push 1');
				opts._headers.push(1);
			}
		}

		if(opts.is_auto_number == true) {
			//另存为的文件里会有编号，所以有编号的就不再重新替换
			if($(header_obj).text().indexOf( opts._headers.join('.') ) != -1){

			}else{
				$(header_obj).text(opts._headers.join('.') + '. ' + $(header_obj).text());
			}
		}
	}
	
	/*
	 * create table with head for anchor for example: <h2 id="#Linux基础">Linux基础</h2>
	 * this method can get a headable anchor
	 * add by https://github.com/chanble
	 */
	function _get_anchor_from_head(header_obj){
		var name = header_obj.html();
		var aname = name.split('.');
		var anchor = aname.pop().trim();
		return anchor;
	}

	/*
	 * 给ztree用的header_nodes增加数据
	 */
	function _add_header_node(opts, header_obj) {
		var id  = encode_id_with_array(opts,opts._headers);//for ztree
		var pid = get_parent_id_with_array(opts,opts._headers);//for ztree
		var anchor = id;//use_head_anchor.html#第二部分

		// 默认使用标题作为anchor
		if(opts.use_head_anchor == true){
			anchor = _get_anchor_from_head(header_obj);
		}
		
		// 设置锚点id
		$(header_obj).attr('id',anchor);

		log($(header_obj).text());

		opts._header_offsets.push($(header_obj).offset().top - opts.highlight_offset);

		log('h offset ='+( $(header_obj).offset().top - opts.highlight_offset ) );

		opts._header_nodes.push({
			id:id,
			pId:pid ,
			name:$(header_obj).text()||'null',//显示名称
			open:true,//默认展开的 树节点
			url:'#'+ anchor,
			target:'_self'
		});
	}
	/*
	 * 计算章节的 offset
	 * 在需要的时机再自行调用,以重算 章节偏移.
	 * 例如 图片资源加载完时, 代码段 折叠展开时 等改变章节偏移的事件发生后.
	 */
	function recalc_offset(opts){
		var old_offsets=opts._header_offsets.slice(0);
		var new_offsets=[];
		
		$(opts.documment_selector).find(':header').each(function(i,o) {
			new_offsets.push($(o).offset().top - opts.highlight_offset);
		});
		
		var isWork=old_offsets.join(',') != new_offsets.join(',');
		console.log('recalc_offset is work:', isWork );
		if(isWork){
			console.log(old_offsets);
			console.log(new_offsets);
		}

		opts._header_offsets=new_offsets;
	}

	/*
	 * 根据滚动确定当前位置，并更新ztree
	 */
	function bind_scroll_event_and_update_postion(opts) {
		var timeout;
		old_i=0;
		var highlight_on_scroll = function(e) {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(function() {
				var top = $(opts.scroll_selector).scrollTop();

				if(opts.debug) console.log('top='+top);

				var i,c = opts._header_offsets.length;
				for (i = 0 ; i < c; i++) {
					// fixed: top+5防止点击ztree的时候，出现向上抖动的情况
					if (opts._header_offsets[i] >= (top + 5) ) {
						if(opts.debug)console.log('opts._header_offsets['+ i +'] = '+opts._header_offsets[i]);

						break;
					}
				}
				//这里原来出现逻辑bug,导致最后一个标题滚不到
				//顺便加了变量缓存当前章节,避免页面一滚动就操作页面dom(只在章节改变时才操作)
				if(i!=old_i){
					old_i=i;
					$('a').removeClass('curSelectedNode');
					// 由于有root节点，所以i应该从1开始
					var obj = $('#tree_' + (i+1) + '_a').addClass('curSelectedNode');
				}

			}, opts.refresh_scroll_time);
		};

		if (opts.highlight_on_scroll) {
			$(opts.scroll_selector).bind('scroll', highlight_on_scroll);
			highlight_on_scroll();
		}
		$(window).bind('load',function(){recalc_offset(opts)});
	}

	/*
	 * 初始化
	 */
	function init_with_config(opts) {
		//opts.highlight_offset = $(opts.documment_selector).offset().top;
		opts.highlight_offset = $('body').offset().top;
	}

	/*
	 * 日志
	 */
	function log(str) {
		return;
		if($.fn.ztree_toc.defaults.debug == true) {
			console.log(str);
		}
	}

	$.fn.ztree_toc = function(options) {

		// 将defaults 和 options 参数合并到{}
		var opts = $.extend({},$.fn.ztree_toc.defaults,options);
		window._opts=opts;

		return this.each(function() {
			opts._zTree = $(this);

			// 初始化
			init_with_config(opts);

			// 创建table of content，获取元数据_headers
			create_toc(opts);

			// 根据_headers生成ztree
			render_with_ztree(opts);

			// 根据滚动确定当前位置，并更新ztree
			bind_scroll_event_and_update_postion(opts);
		});
		// each end
	}

	//定义默认
	$.fn.ztree_toc.defaults = {
		_zTree: null,
		_headers: [],
		_header_offsets: [],
		_header_nodes: [{ id:1, pId:0, name:"Table of Content",open:true}],
		debug: true,
		/*
		 * 使用标题作为anchor
		 * create table with head for anchor for example: <h2 id="#Linux基础">Linux基础</h2>
		 * 如果标题是唯一的，建议开启此选项，如果标题不唯一，还是使用数字吧
		 * 此选项默认是false，不开启
		 */
		use_head_anchor: false,
		scroll_selector: 'window',//在chrome上 $(window) 为空
		highlight_offset: 0,
		highlight_on_scroll: true,
		/*
		 * 计算滚动判断当前位置的时间，默认是50毫秒
		 */
		refresh_scroll_time: 50,
		documment_selector: 'body',
		/*
		 * ztree的位置，默认是在上部
		 */
		is_posion_top: true,
		/*
		 * 默认是否显示header编号
		 */
		is_auto_number: false,
		/*
		 * 默认是否展开全部
		 */
		is_expand_all: true,
		/*
		 * 是否对选中行，显示高亮效果
		 */
		is_highlight_selected_line: true,
		step: 100,
		ztreeStyle: {
			width:'260px',
			overflow: 'auto',
			//position: 'fixed',
			'z-index': 10,
			//border: '0px none',
			//left: '0px',
			//bottom: '0px',
			// height:'100px'
		},
		ztreeSetting: {
			view: {
				dblClickExpand: false,
				showLine: true,
				showIcon: false,
				selectedMulti: false
			},
			data: {
				simpleData: {
					enable: true,
					idKey : "id",
					pIdKey: "pId",
					// rootPId: "0"
				}
			},
			callback: {
				beforeClick: function(treeId, treeNode) {
					$('a').removeClass('curSelectedNode');
					if(treeNode.id == 1){
						// TODO: when click root node
						console.log('click root table of content');
					}
					if($.fn.ztree_toc.defaults.is_highlight_selected_line == true) {
						$('#' + treeNode.id).css('color' ,'red').fadeOut("slow" ,function() {
								// Animation complete.
							$(this).show().css('color','black');
						});
					}
				},
				onRightClick: function(event, treeId, treeNode) {
					if(treeNode.id == 1){
						// TODO: when right_click root node:table content
						console.log('right_click root table of content');
					}
				}
			}
		}
	};

})(jQuery);
