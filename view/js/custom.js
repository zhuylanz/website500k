$(document).ready(function(){
		$(".menu").click(function(){
			$(".menu-full").addClass( "selected" );
		});

		$(".click-submenu").click(function(){
			$(".inbox-list").toggle("slow");
		});
		$(".click-submenu1").click(function(){
			$(".list-system").toggle("slow");
		});
		$(".button-menu3").click(function(){
			$("body").addClass('oppenmenu3', {duration:500});
		});
		$(".click-submenu2").click(function(){
			$(".list-system2").toggle();
		});
	    $(".click-submenu3").click(function(){
			$(".box-search").toggle();
		});
	
/*
		$('[data-toggle="tooltip"]').tooltip();   
		 $(".section-chat-left-body ul li").click(function (){
            $('html, body').animate({
                scrollTop: $(".chat-center-bottom").offset().top
            }, 300);
        });
*/
		$('[data-toggle="tooltip"]').tooltip();   
		 $(".section-chat-left-header .icon-message").click(function(){
			$('.section-chat-left-body ul.list2').show();
			$('.section-chat-left-body ul.list1').hide();
			$('.section-chat-left-body ul.list3').hide();
		});
		$(".section-chat-left-header .icon-note").click(function(){
			$('.section-chat-left-body ul.list3').show();
			$('.section-chat-left-body ul.list2').hide();
			$('.section-chat-left-body ul.list1').hide();
		});		
		jQuery(".has-submenu").click(function(){
			$(this).parent().next().toggle("slow");
			$(this).parent().toggleClass("submenu-hide");
		});

});	



