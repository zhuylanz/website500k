if (screen && screen.width > 820) {
		  
	

			function openNav() {
				document.getElementById("mySidenav").style.width = "4.5%";
				document.getElementById("main").style.width = "95.5%";
				$("body").removeClass('openmenu', {duration:500});
			}

			function closeNav() {
				document.getElementById("mySidenav").style.width = "19%";
				 document.getElementById("main").style.width = "81%";
				$("body").addClass('openmenu', {duration:500});
			}
		}	
		if (screen && screen.width < 820) {
			 $(document).ready(function(){
				 $("body").addClass('openmenu', {duration:500});
				 $(".openbtn").click(function(){
					$(".left-sidebar-content").toggle("slow");
				});
			});
		}


	function scrollFunction() {
		    var elmnt = document.getElementById("section-chat-center-last");
		    elmnt.scrollIntoView();
		}