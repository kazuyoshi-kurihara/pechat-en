var COMMON = window.COMMON || {};

COMMON.Accordion = function ( $base ) {
	this.$base = $base;
	this.$trigger = this.$base.find('.jsc_accordion_trigger');
	this.$content = this.$base.find('.jsc_accordion_content');
	this.animateTime = 500;
}
COMMON.Accordion.prototype = {
	CLASSNAME : {
		IS_HIDDEN : 'is_hidden',
		IS_ACTIVE : 'is_active'
	},
	init: function () {
		this.setParameters();
		this.bindEvents();
	},
	setParameters : function () {
		var _this = this;
		this.$content.each(function( ) {
			$(this).addClass( _this.CLASSNAME.IS_HIDDEN )
		});
	},
	bindEvents : function () {
		var _this = this;
		this.$trigger.on('click', function () {
			if( _this.$content.is(':animated') ) {
				return;
			}

			// _this.$content.slideToggle( _this.animateTime );

			$(this).toggleClass( _this.CLASSNAME.IS_ACTIVE )

			if(_this.$content.hasClass( _this.CLASSNAME.IS_HIDDEN )){
				_this.$content.removeClass( _this.CLASSNAME.IS_HIDDEN )
			}else {
				_this.$content.addClass( _this.CLASSNAME.IS_HIDDEN )
			}

			_this.rotateArrow();

		});
	},
	rotateArrow : function () {
		var _this = this
		var $target = this.$trigger.find( '.sg_accordion_arrow' ).find('img');

		var targetSrc = $target.attr('src');
		var targetName = targetSrc.split( "." );
		if( targetName[1].substr( -6 ) === '_after' ){
			var changeName = '.' +  targetName[1].replace( /_after/gi , "" ) + '.' + targetName[2];
		}else {
			var changeName = '.' +  targetName[1] + '_after'+ '.' + targetName[2];
		}
		$target[0].src = changeName;
	}
}



COMMON.CheckUpload = function ( $base ) {
	this.$base = $base;
	this.$target = this.$base.find('.jsc_check_upload_target');
	this.MatchCheck = []
}

COMMON.CheckUpload.prototype = {
	DATA : {
		UPLOAD_TARGET :  'uploadTarget'
	},
	DAY : {
		COOKIE_SAVE_DAY : 365
		// Cookieの保存日数
	},
	init : function () {
		this.bindEvents();
		this.setParameters();
	},
	setParameters : function () {
		var _this = this;
		this.createArray();

		for( keyJson in _this.cookieArray ){
			for( keyData in _this.cookieArray[keyJson] ){
				this.getCookie( keyData )
			}
		}

		for( var urlNum = 0, urlLen =  this.getUrlArray.length; urlNum < urlLen; urlNum++ ){
			_this.getJsonData( urlNum );
		}
	},
	createArray : function () {

//　新規追加時は、こちらに追加

		this.getUrlArray = [
			{
				'name': 'app_version' ,
				'url' : '../json/app_version.json',
				'data' : [
						'ios_version',
						'android_version'
				]
			} ,
			{
				'name': 'info' ,
				'url' : '../json/info.json',
				'data' : [
						'update_date',
						'contest_date',
						'bug01_date',
						'update01_date'
				]
			} ,
		]

		this.jsonArray = {
			'app_version' : {
				'ios_version' : [],
				'android_version' : []
			},
			'info' : {
				'update_date' : [],
				'contest_date' : [],
				'bug01_date' : [],
				'update01_date' : []
			}
		}

		this.cookieArray = {
			'app_version' : {
				'ios_version' : [],
				'android_version' : []
			},
			'info' : {
				'update_date' : [],
				'contest_date' : [],
				'bug01_date' : [],
				'update01_date' : []
			}
		}
	},

	getJsonData : function ( targetNum ) {
		var url = this.getUrlArray[ targetNum ].url
		var name = this.getUrlArray[ targetNum ].name
		var data = this.getUrlArray[ targetNum ].data

		var _this = this;
		$.ajax({
			type: 'GET',
			url: url,
			dataType: 'json',
			success: function(json){
				for(var curData = 0, dataLen = data.length; curData < dataLen; curData++){
					var targetData = data[curData];

					for( keyJson in _this.jsonArray ){
						for( keyData in _this.jsonArray[keyJson] ){
							if( keyData === targetData ){
								_this.jsonArray[keyJson][keyData].push( json[keyData] );
							}
						}
					}
				}
			_this.$base.trigger( 'ajax_success' );
			}
		});
	},

	getCookie : function ( c_name ) {
		var _this = this;

		var st="";
		var ed="";
		if(document.cookie.length>0){
			st=document.cookie.indexOf(c_name + "=");
			if(st!=-1){
				st=st+c_name.length+1;
				ed=document.cookie.indexOf(";",st);
				if(ed==-1) ed=document.cookie.length;
				for( keyJson in _this.cookieArray ){
					for( keyData in _this.cookieArray[keyJson] ){
						if( keyData === c_name ){
							_this.cookieArray[keyJson][keyData].push( unescape(document.cookie.substring(st,ed)) );
						}
					}
				}
			}
		}
	},
	bindEvents : function () {
		var _this = this;
		this.$base.on( 'ajax_success', function() {

			if( _this.dataMatchCheck() ){
				_this.flgControll();
				_this.$target.on('click', function() {
					var $target = $(this);
					$target.removeClass( 'new' )
					var targetValue = $target.data( _this.DATA.UPLOAD_TARGET );

					for( keyJson in _this.jsonArray ){
						for( keyData in _this.jsonArray[keyJson] ){
							if( Array.isArray(targetValue )){
								for( var j = 0, len = targetValue.length; j < len; j++ ){
									var curTargetValue = targetValue[j]
									if ( keyData === curTargetValue ){
										_this.setCookie( keyData,
														 _this.jsonArray[ keyJson ][ keyData ],
														  _this.DAY.COOKIE_SAVE_DAY )
									}
								}
							}else if ( keyData === targetValue ){
								_this.setCookie( keyData,
												 _this.jsonArray[ keyJson ][ keyData ],
												 _this.DAY.COOKIE_SAVE_DAY )
							}
						}
					}
				})
			}
		} )
	},
	dataMatchCheck : function () {
		this.MatchCheck = []

		var isChange = false;
		var addKeyName = undefined;
		for(keyName in this.jsonArray){
			for(keyData in this.jsonArray[keyName]){

				for(var i = 0, leng = this.jsonArray[ keyName ][ keyData ].length; i < leng; i++){
					var curJson = this.jsonArray[ keyName ][ keyData ][ i ]
					var curCookie = this.cookieArray[ keyName ][ keyData ][ i ]
					if( curJson !== curCookie && addKeyName !== keyName){
						this.MatchCheck.push( keyData )
						addKeyName = keyData;
						isChange = true;
					}
				}

			}
		}
		return isChange;
	},
	flgControll : function () {
		var _this = this;
		this.$target.each( function() {
			var $target = $(this)
			var targetValue = $target.data( _this.DATA.UPLOAD_TARGET );

			for( var i = 0, len = _this.MatchCheck.length; i < len; i++ ){

				if( Array.isArray(targetValue )){
					for( var j = 0, len = targetValue.length; j < len; j++ ){
						var curTargetValue = targetValue[j]
						if ( curTargetValue === _this.MatchCheck[i]){
							$target.addClass( 'new' )
						}
					}
				}else if ( targetValue === _this.MatchCheck[i]){
					$target.addClass( 'new' )
				}
			}
		})
	},

	setCookie : function ( c_name, value, expiredays ) {

		var path = location.pathname;
		var paths = new Array();
		paths = path.split("/");
		if(paths[paths.length-1] != ""){
		    paths[paths.length-1] = "";
		    path = paths.join("/");
		}
		var extime = new Date().getTime();
		var cltime = new Date(extime + (60*60*24*1000*expiredays));
		var exdate = cltime.toUTCString();
		var s="";
		s += c_name +"="+ escape(value);
		s += "; path="+ path;
		if(expiredays){
		    s += "; expires=" +exdate+"; ";
		}else{
		    s += "; ";
		}
		document.cookie=s;
		// }

	}
}



$(function () {
	$('.jsc_accordion').each(function () {
		new COMMON.Accordion($(this)).init();
	});

	$('.jsc_check_upload').each(function () {
		new COMMON.CheckUpload($(this)).init();
	});

});