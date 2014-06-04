
jQuery(function($){
	var count = 1000;
	function init(){
		if (location.hash){
			read_hash();
		}
		else{
			$('.main').append( get_empty_node(0, 1000, 1000, 'Home'));
			//$('.utility').append( get_empty_node(0, 0, 'Utility')) ;
			//
			for (var i = 0; i<4; i++){
				//$('#node_1000 > .node_inner .add_child').click();
			}
		}
	}
	//share link
	//on click create hash and reset page url for copy/paste
	
	$('.page').on('click', '.add_child', function(e){
		e.preventDefault();
		add_child( $(this).parents('.node').attr('data-id') );
	});

	$('.page').on('click', '.remove_me', function(e){
		e.preventDefault();
		//get this nodes parents id
		var pid = $(this).closest('.subs').parent().attr('data-id');
		//console.log('.remove_me.click',pid);
		//remove this node
		$(this).closest('.node').remove();
		count_children( pid );
	});

	$('.page').on('click', '.add_notes', function(e){
		e.preventDefault();
		$(this).closest('.node_inner').find('.notes').toggle();
		$(this).closest('.node').toggleClass('show_notes');
		if( $(this).find('i').attr('class') == 'icon-chevron-down'){//display hide
			$(this).find('span').text('Hide Notes');
			$(this).find('i').attr('class', 'icon-chevron-up');
		}
		else{//display edit
			$(this).find('span').text('Add Notes');
			$(this).find('i').attr('class', 'icon-chevron-down');
		}
	});
	$('.page').on('click', '.edit', function(e){
		e.preventDefault();
		$(this).closest('.node_inner').find('.page_name').focus().select();
	});

	$('.page').on('click', '.dropdown-toggle', function(e){
		$(this).dropdown();
	});

	function reset_hash(){
		location_hash = '';
		$('.node').each(function(){
			//|title,id,pid|
			location_hash += $(this).find('.page_name').val() + ',' + $(this).attr('data-id') + ',' + $(this).attr('data-parent_id') + '|';
		});
		location.hash = location_hash;
		$('.hash_href').attr('href', location.href);
		$('.hash').val(location.href);
		
		//shorturl
		var long_url = 'http://brandfeverinc.github.io/interactive-sitemap-builder/#'+location_hash;
		var bitly_api_url = 'https://api-ssl.bitly.com/v3/shorten?access_token=967ae71a7a87bcf4588673f2feadbd8a5525449b&longUrl='+escape(long_url);
		$.getJSON(bitly_api_url, function(json){
			console.log(json.data.url);
			$('.hash_href').attr('href', json.data.url);
			$('.hash').val(json.data.url);
		});

	}
	function read_hash(){
		//decode the url in case it's been encoded
		url = decodeURIComponent(location.hash.replace(/\+/g,  " "));
		nodes = url.substr(1,location.hash.length-2).split('|');
		for (var i=0; i<nodes.length;i++){
			//console.log(i, nodes[i]);
			nodes[i] = nodes[i].split(',');
			//console.log(i, nodes[i], nodes[i][2]);
			//|title,id,pid|
			if (i == 0){
				//console.log( 'get_empty_node(0, 0,', nodes[i][1], nodes[i][0],')' );
				//get_empty_node(level, pid, id, value)
				$('.main').append( get_empty_node(0, 0, nodes[i][1], nodes[i][0]));
			}
			else {
				//console.log('add_child(',nodes[i][2], nodes[i][1], nodes[i][0],')' );
				//add_child(pid, id, value)
				add_child(nodes[i][2], nodes[i][1], nodes[i][0]);
			}
		}
	}
	//parent id
	//node id
	//title
	function add_child(pid, id, value){
		parent = $('#node_'+pid);
		//parent_id = parseInt( parent.attr('data-id') );
		var level = parseInt( $('#node_'+pid).attr('data-level') ) + 1;
		count = count_all() + 1;
		if (id == undefined){ id = count + 1000; }
		if (value == undefined){ value = "Page " + count; }

		// console.log('pid', pid, 'level', level, 'id', id, 'value', value, 'count', count);

		$('#node_'+pid+ ' > ul').append( get_empty_node(level, pid, id, value) );
		
		count_children( pid );

		make_sortable();

		//focus title of newly added node
		$('#node_' + (count-1) + ' input').focus().select();

		//keep fresh the xml
		// $('.xml').text( make_xml() );
		//reset_hash();
	}
	//level/depth
	//parent id
	//node id
	//title
	function get_empty_node(level, pid, id, value){
		if (id == undefined){ id = count; }
		else { count = id; }
		if (value == undefined){ value = "Page " + count; }
		var empty_node = '<li class="node has_child" data-name="' + value + '" data-level="' + level + '" data-id="' + count + '" id="node_' + count++ + '" data-parent_id="' + pid + '">' + 
							'<div class="node_inner">' +
								'<div class="input_wrap"><input class="page_name span" type="text" value="' + value + '" placeholder="Page Name" /></div>' +
								'<div class="btn-toolbar utility-menu">' +
								'	<div class="btn-group">' +
								'		<a href="#" class="handle btn" title="Rearrange"><i class="icon-move"></i></a>' +
								'		<a href="#" class="add_child btn" title="Add Child Page"><i class="icon-plus"></i></a>' +
								'		<a href="#" class="btn dropdown-toggle" data-toggle="dropdown">' +
								'			<i class="icon-cog"></i><i class="icon-caret-down"></i>' +
								'		</a>' +
								'		<ul class="dropdown-menu">' +
								'			<li><a href="#" class="edit"><i class="icon-pencil"></i> Edit</a></li>' +
								'			<li><a href="#" class="add_notes"><i class="icon-chevron-down"></i> <span>Add Notes</span></a></li>' +
								'			<li><a href="#" class="remove_me"><i class="icon-trash"></i> Delete</a></li>' +
								'		</ul>' +
								'	</div>' +
								'</div>' +
							'	<textarea class="notes" placeholder="Page Content" tabindex="-1"></textarea>' +
							'</div>' +
							'<ul class="subs sort" data-level="' + (level+1) + '" data-children="0"></ul>' +
						'</li>';
		return empty_node;
	}
	function count_children(id){
		num = $('#node_'+id + ' > ul > li').length;
		//console.log(num);
		//$('#'+id).attr('data-children', num );
		$('#node_'+id +' > ul').attr('data-children', num );
	}
	function count_all(){
		var nodes = $('.node');
		return nodes.length;
	}
	function reset_level(nid){
		num = $('#node_'+nid).parents('ul').length;
		//console.log(num);
		//$('#'+id).attr('data-children', num );
		$('#node_'+nid).attr('data-level', num-1 );
		$('#node_'+nid).parent().attr('data-level', num-1 );
	}
	function reset_parent(nid){
		var parent_id = $('#node_'+nid).parent().parent().attr('data-id');
		//console.log('resetting parent for ' + nid + ' to ' + parent_id );
		$('#node_'+nid).attr('data-parent_id', parent_id );
	}

	function make_sortable(){
		$('.sort').sortable({
	      connectWith: ".sort",
	      placeholder: "drag-node node",
	      handle: ".handle",
	      start: function(){
	      	$('body').addClass('dragging');
	      },
	      stop: function(){
	      	$('body').removeClass('dragging');
	      	$('.node').each(function(){
	      		count_children( $(this).attr('data-id') );
	      		reset_level( $(this).attr('data-id') );
	      		reset_parent( $(this).attr('data-id') );
	      	})
	      	//reset_hash();
	      }
	  	});
		$('.sort').disableSelection();
	}



	function make_xml(){
		reset_hash();
		// create the XML structure recursively
		var xml = "<?xml version='1.0' encoding='UTF-8' ?>";
			xml += "\n<!-- This is a WordPress eXtended RSS file generated by sitemap tool as an export of your sitemap. -->";
			xml += "\n<!-- Return to edit your sitemap and reexport if needed at: " + window.location + " -->";
			xml += "\n<!-- It contains information about your site's posts, pages, comments, categories, and other content. -->";
			xml += "\n<!-- You may use this file to transfer that content from one site to another. -->";
			xml += "\n<!-- This file is not intended to serve as a complete backup of your site. -->";
			xml += "\n<!-- To import this information into a WordPress site follow these steps: -->";
			xml += "\n<!-- 1. Log in to that site as an administrator. -->";
			xml += "\n<!-- 2. Go to Tools: Import in the WordPress admin panel. -->";
			xml += "\n<!-- 3. Install the 'WordPress' importer from the list. -->";
			xml += "\n<!-- 4. Activate & Run Importer. -->";
			xml += "\n<!-- 5. Upload this file using the form provided on that page. -->";
			xml += "\n<!-- 6. You will first be asked to map the authors in this export file to users -->";
			xml += "\n<!--    on the site. For each author, you may choose to map to an -->";
			xml += "\n<!--    existing user on the site or to create a new user. -->";
			xml += "\n<!-- 7. WordPress will then import each of the posts, pages, comments, categories, etc. -->";
			xml += "\n<!--    contained in this file into your site. -->";
			xml += "\n<!-- generator='WordPress/3.5.1' created='2013-01-01 12:00' -->";
			xml += "\n<rss version='2.0' xmlns:excerpt='http://wordpress.org/export/1.2/excerpt/' xmlns:content='http://purl.org/rss/1.0/modules/content/' xmlns:wfw='http://wellformedweb.org/CommentAPI/' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:wp='http://wordpress.org/export/1.2/' >";
			xml += "\n    <channel>";
			xml += "\n    <title>SiteMap Export</title>";
			xml += "\n    <language>en-US</language>";
			xml += "\n    <wp:wxr_version>1.2</wp:wxr_version>";
			xml += "\n    <wp:author><wp:author_id>1</wp:author_id><wp:author_login>admin</wp:author_login><wp:author_email>support@brandfeverinc.com</wp:author_email><wp:author_display_name><![CDATA[Brand Fever]]></wp:author_display_name><wp:author_first_name><![CDATA[Brand]]></wp:author_first_name><wp:author_last_name><![CDATA[Fever]]></wp:author_last_name></wp:author>";
			xml += "\n    <wp:term>";
			xml += "\n\t    <wp:term_id>2</wp:term_id>";
			xml += "\n\t    <wp:term_taxonomy>nav_menu</wp:term_taxonomy>";
			xml += "\n\t    <wp:term_slug>main-menu</wp:term_slug>";
			xml += "\n\t    <wp:term_name><![CDATA[Main Menu]]></wp:term_name>";
			xml += "\n    </wp:term>";
			xml += "\n    <wp:term>";
			xml += "\n\t    <wp:term_id>3</wp:term_id>";
			xml += "\n\t    <wp:term_taxonomy>nav_menu</wp:term_taxonomy>";
			xml += "\n\t    <wp:term_slug>utility-menu</wp:term_slug>";
			xml += "\n\t    <wp:term_name><![CDATA[Utility Menu]]></wp:term_name>";
			xml += "\n    </wp:term>";
			xml += "\n    <generator>http://wordpress.org/?v=3.5.1</generator>";

		var order = 0;
		for (var i = 1000; i < count + 1000; i++){
			if($('#node_'+i).hasClass('node')){
				var node = $('#node_' + i );
				var node_x2 = i * 2;
				var node_parent = node.attr('data-parent_id') == 1000 ? 0 : node.attr('data-parent_id');
				var node_parent_x2 = node_parent * 2;
				var node_title = node.find('.page_name').val();
				var node_content = node.find('.notes').val();
				order++;

				xml += "\n    <item id='menu_node_" + i + "'>";
				xml += "\n    	<title>" + node_title + "</title>";
				xml += "\n    	<dc:creator>admin</dc:creator>";
				xml += "\n    	<wp:post_id>" + i + "</wp:post_id>";
				xml += "\n    	<wp:status>publish</wp:status>";
				xml += "\n    	<wp:post_parent>" + node_parent + "</wp:post_parent>";
				xml += "\n    	<wp:menu_order>" + order + "</wp:menu_order>";
				xml += "\n    	<wp:post_type>nav_menu_item</wp:post_type>";
				xml += "\n    	<category domain='nav_menu' nicename='main-menu'><![CDATA[Main Menu]]></category>";
				xml += "\n    	<wp:postmeta>";
				xml += "\n    		<wp:meta_key>_menu_item_type</wp:meta_key>";
				xml += "\n    		<wp:meta_value><![CDATA[post_type]]></wp:meta_value>";
				xml += "\n    	</wp:postmeta>";
				xml += "\n    	<wp:postmeta>";
				xml += "\n    		<wp:meta_key>_menu_item_menu_item_parent</wp:meta_key>";
				xml += "\n    		<wp:meta_value><![CDATA[" + node_parent + "]]></wp:meta_value>";
				xml += "\n    	</wp:postmeta>";
				xml += "\n    	<wp:postmeta>";
				xml += "\n    		<wp:meta_key>_menu_item_object_id</wp:meta_key>";
				xml += "\n    		<wp:meta_value><![CDATA[" + node_x2 + "]]></wp:meta_value>";
				xml += "\n    	</wp:postmeta>";
				xml += "\n    	<wp:postmeta>";
				xml += "\n    		<wp:meta_key>_menu_item_object</wp:meta_key>";
				xml += "\n    		<wp:meta_value><![CDATA[page]]></wp:meta_value>";
				xml += "\n    	</wp:postmeta>";
				xml += "\n    </item>";
				xml += "\n    <item id='page_node_" + i + "'>";
				xml += "\n    	<title>" + node_title + "</title>";
				xml += "\n    	<dc:creator>admin</dc:creator>";
				xml += "\n    	<content:encoded><![CDATA[" + node_content + "]]></content:encoded>";
				xml += "\n    	<wp:post_id>" + node_x2 + "</wp:post_id>";
				xml += "\n    	<wp:post_name>" + node_title.toLowerCase() + "</wp:post_name>";
				xml += "\n    	<wp:status>publish</wp:status>";
				xml += "\n    	<wp:post_parent>" + node_parent_x2 + "</wp:post_parent>";
				xml += "\n    	<wp:post_type>page</wp:post_type>";
				xml += "\n    </item>";
			}
		}
		xml += "\n</channel>";
		xml += "\n</rss>";

		return xml;
	}


	$(".fancybox").fancybox({
		maxWidth	: 800,
		maxHeight	: 600,
		fitToView	: false,
		width		: '50%',
		height		: '50%',
		autoSize	: false,
		closeClick	: false,
		openEffect	: 'none',
		closeEffect	: 'none',
		type        : 'inline' 
	});

	$('.href').click(function(e){
		e.preventDefault();
		reset_hash();
		//alert( $(this).attr('href') );
	});
	$('.export').click(function(e){
		e.preventDefault();
		//save xml
		$('.xml').text( make_xml() );

	});
	$('.print').click(function(e){
		e.preventDefault();
		window.print();
		
	});

	$('.download').downloadify({
		filename: 'sitemap.xml',
		data: function(){ 
			return $('.xml').text();
		},
		//onComplete: function(){ alert('Your File Has Been Saved!'); },
		//onCancel: function(){ alert('You have cancelled the saving of this file.'); },
		//onError: function(){ alert('You must put something in the File Contents or there will be nothing to save!'); },
		swf: 'Downloadify/media/downloadify.swf',
		downloadImage: 'Downloadify/images/download.png',
		width: 100,
		height: 30,
		transparent: true,
		append: false
	});

	$('.xml').click(function(e){
		$(this).select();	
	});


	/*$('.xml').on('hover', function(e){
		//keep fresh the xml
		$(this).text( make_xml() );
		//reset_hash();
	});*/


	init();


});