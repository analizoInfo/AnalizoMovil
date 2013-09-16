var iOS = false;
var client;
var userCount;

document.addEventListener('deviceready', deviceready, false);

function deviceready() {
    //console.log('deviceready');
    userCount = 0;
    client = new Usergrid.Client({
    	orgName:'analizo.info', //your orgname goes here (not case sensitive)
    	appName:'sandbox', //your appname goes here (not case sensitive)
    	logging: false, //optional - turn on logging, off by default
    	buildCurl: false //optional - turn on curl commands, off by default
    });
    
}
function CrearLista(data) {
    var l1 = '<ul data-role="listview">'; 
   
    data.resetEntityPointer();
    while(data.hasNextEntity()) {
    	 var proyect = data.getNextEntity();
    	 //alert(proyect);
    	 name = proyect.get('name');
    	 descripcion = proyect.get('program');
    	 imagen = proyect.get('Imagen') ;
    	 pregunta = proyect.get('Pregunta');
    	 
    	 alert('Name: ' + name + 'program: ' + descripcion);

    //	 l1 = '<div data-role="collapsible" data-theme="b" data-content-theme="d" data-inset="false" data-iconpos="right" data-collapsed="false">' +
    //     	  '<h3>' + name + '</h3>';
	//     l1 += "<p><img class='imgDisplay' src='" + imagen + "'></p>";
	//     l1 += '<p>' + descripcion + '</p>' + '</div>'; 
	     l1 += '<li data-id=' + name + '>' +
		         '<a href="#verPrograma?id=' + name + '">' +
		         '<img src=' + imagen + 'width="100" height="100"/>' + 
		         '<h3>' + descripcion + '</h3>' +
		          '<p>' + pregunta + '</p>' +
		         '</a>' +
		         '</li>';	     
    }
    l1 += '</ul>';
            /*
                   
            	*/
          
    $("#divProyectos").html(l1);
    $('#divProyectos').trigger("create");
}

function showError(err)
{
		$("#errorL").empty();
		$("#errorL").append(err);
		$("#errorL").css('background-color' , '#c13d3d');
		$("#errorL").fadeIn();
		setTimeout(
			function() 
			{$("#errorL").fadeOut();}, 2000);	
}


$(document).on("pagebeforecreate", "#login", function() {
	$("#login #btnSubmit").click(function(){
		var login = $("#txtLogin").val();
        var pwd = $("#txtPassword").val();
        //showError(login);
        client.logout();
    	client.login(login, pwd,
    		function (err) {
    			if (err) {
    				//alert('could not log user in');
    				showError(err);
    			} else {
    				//alert('user has been logged in');

    				//the login call will return an OAuth token, which is saved
    				//in the client. Any calls made now will use the token.
    				//once a user has logged in, their user object is stored
    				//in the client and you can access it this way:
    				var token = client.token;

    				//Then make calls against the API.  For example, you can
    				//get the user entity this way:
    				client.getLoggedInUser(function(err, data, user) {
    					if(err) {
    						//alert('could not get logged in user');
    						showError(err);
    					} else {
    						//alert('got logged in user');
    						$.mobile.changePage("#inicio", "slide", false, true);
    					}
    				});

    			}
    		}
    	);
        
	});
});

$(document).on("pagebeforecreate", "#inicio", function() {
	var inTimeProyects = 0;
	var outTimeProyects = 0;
	var comprobar = -1;
	var proyects = new Usergrid.Collection({ 'client':client, 'type':'proyects' });
	
	if  (proyects) {
		proyects.resetPaging();
		proyects.fetch(function (err) {
	        if (err) {
	        	$("#divProyectos").html("No existen proyectos");
	            $('#divProyectos').trigger("create");	            
	        } else {
	        	CrearLista(proyects);
	        }
	      });
	    }
	else
		{
			$("#divProyectos").html("No existen proyectos");
	        $('#divProyectos').trigger("create");
		}
	
	
	
	alert(client.isLoggedIn());
	//proyect
});


