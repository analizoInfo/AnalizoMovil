var iOS = false;
var client;
var userCount;
var userName;
var id;
var proyectoSel;

$(document).ready(function () {
    // Handler for .ready() called.
    document.addEventListener("deviceready", onDeviceReady, true);
    
});

function exitAppPopup() {
    navigator.notification.confirm(
          'Exit PhoneGap ' + device.cordova + ' Demo?'
        , function(button) {
              if (button == 2) {
                  navigator.app.exitApp();
              } 
          }
        , 'Exit'
        , 'No,Yes'
    );  
    return false;
}

function onDeviceReady() {
    //console.log('deviceready');
    userCount = 0;
    client = new Usergrid.Client({
        orgName: 'analizo.info', //your orgname goes here (not case sensitive)
        appName: 'sandbox', //your appname goes here (not case sensitive)
        logging: false, //optional - turn on logging, off by default
        buildCurl: false //optional - turn on curl commands, off by default
    });

    var options = {
        type: 'users',
        qs: { limit: 9999 } //limit statement set to 9999
    }

    client.createCollection(options, function (err, users) {
        if (err) {
            alert('could not get all channels');
        } else {
            //we got 50 channels, now display the Entities:
            while (users.hasNextEntity()) {
                //get a reference to the dog
                var user = users.getNextEntity();
                userCount = userCount + 1;
                
            }
            window.sessionStorage.setItem("numUsuarios", userCount);
            if (($.mobile.activePage.is('#inicio'))||
            		($.mobile.activePage.is('#login'))){
                userCount = window.sessionStorage.getItem("numUsuarios");
                if ((userName) && (userCount)) {
                    $("#divFooterInicio").html('<b>Hola ' + userName + '. En estos momentos hay ' + userCount + ' analistas en la comunidad.</b>');
                }
            }
        }
    });
    
    document.addEventListener("backbutton", function(e){
        if(($.mobile.activePage.is('#inicio')) ||
        		($.mobile.activePage.is('#login'))){
            e.preventDefault();
            navigator.app.exitApp();
        }
        else {
            navigator.app.backHistory();
        }
    }, false);

   
    
    if (client.isLoggedIn()) {
        var token = client.getToken();
        if (token) {
            userName = window.localStorage.getItem('username');
            userCount = window.sessionStorage.getItem('numUsuarios');
            console.log(userName + userCount);
            //MostrarMensaje("Usuario ya logeado", false);
            $.mobile.changePage("#inicio", "slide", false, true);
            //if($.mobile.activePage.is('#login'))
            //{ 
                console.log('antes delay');
                setTimeout(function () {
                    navigator.splashscreen.hide();
                    console.log('delay');
                    //something you want delayed

                }, 2000);
                console.log('despues delay');
            //}
        }
    }
    else {
        console.log('No logeado');
        navigator.splashscreen.hide();
    }

	//while (!$.mobile.activePage.is('#inicio'))
       
	
   
}

$(document).on("mobileinit", function () {
    $.mobile.defaultPageTransition = "slide";
    $.mobile.transitionFallbacks.slideout = "none";
});

function CrearLista(data) {
	var inTimeProyects = 0;
    var outTimeProyects = 0;
    var comprobar = -1;
    var enEmision = [];
    var enFuturo = [];
    data.resetEntityPointer();
    now = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

    var weekday_sp = new Array(7);
    weekday_sp[0] = "Domingo";
    weekday_sp[1] = "Lunes";
    weekday_sp[2] = "Martes";
    weekday_sp[3] = "Miércoles";
    weekday_sp[4] = "Jueves";
    weekday_sp[5] = "Viernes";
    weekday_sp[6] = "Sábado";

    var now_day = weekday[now.getDay()];
    
    while (data.hasNextEntity()) {
        var proyect = data.getNextEntity();
        var proyect_day = proyect.get(now_day);

        nextDay = now.getDay();
        while (!proyect.get(weekday[nextDay])) {
            nextDay = nextDay + 1;
            if (nextDay == 7) { nextDay = 0; }
        }
        
        if (proyect_day) {

            var hora = '';
            var inicio_p = '';
            var fin_p = '';

            if (now.getMinutes() < 10) { hora = '' + now.getHours() + '0' + now.getMinutes() }
            else { hora = '' + now.getHours() + '' + now.getMinutes() }

            inicio_p = '' + proyect.get('HoraInicio') + '' + proyect.get('MinutoInicio');
            fin_p = '' + proyect.get('HoraFin') + '' + proyect.get('MinutoFin');

            if (parseInt(hora) >= parseInt(inicio_p)) {
                if (parseInt(hora) <= parseInt(fin_p)) {
                    comprobar = 1;

                } else { comprobar = 0; }
            } else { comprobar = 0; }
        } else { comprobar = 0; }
        if (comprobar) {
            inTimeProyects = inTimeProyects + 1;        
            enEmision.push(proyect);
        }
        else {
            outTimeProyects = outTimeProyects + 1;
            enFuturo.push(proyect);
        }
    }

    var lEnEmision;
    if (enEmision.length > 0) {
        lEnEmision = '<div data-role="collapsible" data-collapsed="false" data-content-theme="a"> <h3>Ahora puedes analizar</h3><ul data-role="listview" id="liProyectosActuales">'
        for (var i = 0; i < enEmision.length; i++) {
            var pro = enEmision[i];
            name = pro.get('name');
            descripcion = pro.get('program');
            imagen = pro.get('Imagen');
            pregunta = pro.get('Pregunta');
            lEnEmision += '<li data-id=' + name + '>' +
                    '<a href="#verPrograma?id=' + name + '">' +
                    '<img src=' + imagen + ' class="ui-li-thumb"/>' +
                    '<h3>' + descripcion + '</h3>' +
                     '<p>' + pregunta + '</p>' +
                    '</a>' +
                    '</li>';
        }
        lEnEmision += '</ul></div>';
    }
    else
        lEnEmision = '<div data-role="collapsible" data-collapsed="false" data-content-theme="a"> <h3>No existen proyectos para analizar en este horario</h3></div>';

    var lEnFuturo;
    if (enFuturo.length > 0) {
        lEnFuturo = '<div data-role="collapsible" data-collapsed="false" data-content-theme="a"> <h3>Proximos analis</h3><ul data-role="listview" id="liProyectosProximos">';
        for (var i = 0; i < enFuturo.length; i++) {
            var pro = enFuturo[i];
            name = pro.get('name');
            descripcion = pro.get('program');
            imagen = pro.get('Imagen');
            pregunta = pro.get('Pregunta');
            lEnFuturo += '<li data-id=' + name + ' data-icon="false">' +
            		'<div class="conPadding">' +
                    '<img src=' + imagen + ' class="ui-li-thumb"/>' +
                    '<h3>' + descripcion + '</h3>' +
                     '<p>' + pregunta + '</p>' +
                    '</div>' +
                    '</li>';
        }
        lEnFuturo += '</ul></div>';
    }
    else
        lEnFuturo = '<div data-role="collapsible" data-collapsed="false" data-content-theme="a"> <h3>No existen proyectos proximamente</h3></div>';
    
    $("#divProyectos").html(lEnEmision + lEnFuturo); //
    $('#divProyectos').trigger("create");
}


function MostrarMensaje(msg, esError) {
    var color = "#83b321";
    console.log(msg);
    if (esError)
        color = "#c13d3d";
	$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>"+msg+"</h3></div>")
	.css({ display: "block", 
	"background-color": color,
		opacity: 0.90, 
		position: "fixed",
		padding: "7px",
		"text-align": "center",
		width: "270px",
		left: ($(window).width() - 284)/2,
		top: $(window).height()/2 })
	.appendTo( $.mobile.pageContainer ).delay( 1500 )
	.fadeOut( 400, function(){
		$(this).remove();
	});
	console.log(msg);
}

$.urlParam = function (url, name) {
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(url);
    if (results != null) return results[1];
    else return -1;
};

function LogearUsuario(usuario, pasword, rec) {
    var logged = client.isLoggedIn();

    if (logged && (usuario == '')) {
        userName = window.localStorage.getItem('username');
        $.mobile.changePage("#inicio", "slide", false, true);
    }
    else {
        client.logout();
        client.login(usuario, pasword,
             function (err) {
                 if (err) {
                     alert('El usuario o password no son correctos');
                 }
                 else {
                     var token = client.token;

                     client.getLoggedInUser(function (err, data, user) {
                         if (err) {
                             alert(err);
                         } else {

                             userName = user.get('username');
                             //if (rec) {
                                 window.localStorage.setItem('username', userName);
                             //}
                             $.mobile.changePage("#inicio", "slide", false, true);
                         }
                     });

                 }
             }
         );
    }
}

function doCheckIn(indice, categoria) {
    var proyect_load = {
        type: 'proyects',
        name: indice
    };
    MostrarMensaje("Resultado registrado correctamente", false);
    now = new Date();
    client.getEntity(proyect_load, function (err, proyecto) {
        if (err) {

        }
        else {
            console.log('ObtenerProyecto');
            var hora = '';
            var inicio_p = '';
            var fin_p = '';
            if (now.getMinutes() < 10) { hora = '' + now.getHours() + '0' + now.getMinutes() }
            else { hora = '' + now.getHours() + '' + now.getMinutes() }
            inicio_p = '' + proyecto.get('HoraInicio') + '' + proyecto.get('MinutoInicio');
            fin_p = '' + proyecto.get('HoraFin') + '' + proyecto.get('MinutoFin');
            if (parseInt(hora) >= parseInt(inicio_p)) {
                if (parseInt(hora) <= parseInt(fin_p)) {
                    var resultados = proyecto.get('Resultados');
                    var options = {
                        type: resultados
                    }
                    
                    client.createCollection(options, function (err, checkin) {
                        if (err) {
                        	console.log('could not make collection');
                        }
                        else {
                           
                            console.log('createCollection');
                            now = new Date();
                            //create a new dog and add it to the collection
                            var options = {
                                name: now.toString() + '-' + proyecto.get('name') + '-' + userName,
                                categoria: categoria,
                                proyecto: proyecto.get('name'),
                                hora: now.getHours(),
                                minuto: now.getMinutes(),
                                segundo: now.getSeconds(),
                                mes: now.getMonth(),
                                anyo: now.getFullYear(),
                                //año: now.getFullYear(),
                                //año: '2013',
                                dia: now.getDate(),
                                diaSemana: now.getDay(),
                                fecha: now.toString(),
                                usuario: userName
                            }
                            //just pass the options to the addEntity method
                            //to the collection and it is saved automatically
                            checkin.addEntity(options, function (err, last, data) {
                                if (err) {
                                	console.log('extra dog not saved or added to collection');
                                }
                                else {
                                    var results = proyecto.get('cat' + categoria + '_results');
                                    results = parseInt(results) + 1;
                                    proyecto.set('cat' + categoria + '_results', results);
                                    proyecto.save(function (err) {
                                        if (err) {
                                        	console.log('proyect not saved');
                                        }
                                        else {
                                        	console.log('proyect is saved');
                                        	//MostrarMensaje("Resultado registrado correctamente", false);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else { MostrarMensaje("El programa ha terminado.", true) }
            } else { MostrarMensaje("El programa ha terminado.", true) }
        }
    });
}

$(document).on("pagebeforecreate", "#login", function () {
    $("#login #btnSubmit").click(function () {
        var login = $("#txtLogin").val();
        var pwd = $("#txtPassword").val();
        var rec = $("#chkRecordar").val();

        LogearUsuario(login, pwd, rec);
    });
});

function ConstruirElementoListaProyecto(id, categoria, descripcion, imagen) {
    var liElemento = '<li data-id=' + id + ' data-icon="false">' +
	'<div class="conPadding">' +
    '<img src=' + imagen + ' class="ui-li-thumb"/>' +
    '<h3>' + categoria + '</h3>' +
     '<p>' + descripcion + '</p>' +
    '</div>' +
    '</li>';
    return liElemento;
}

function ConstruirElementoListaResultados(id, categoria, descripcion, imagen) {
    var liElemento = '<li data-id=' + id + '>' +
	'<a>' +
    '<img src=' + imagen + ' class="ui-li-thumb"/>' +
    '<h3>' + categoria + '</h3>' +
     '<p>' + descripcion + '</p>' +
    '</a>' +
    '</li>';
    return liElemento;
}

function ConstruirBotonListaResultados(id, categoria, descripcion, imagen) {
    var tema = "b";
    if(id==2)
    	tema="a";
    else
    	if(id==3)
        	tema="d";
        else
        	if(id==4)
            	tema="c";
    var liElemento = '<a href="#" data-role="button" data-id="' + id + '" data-theme="' + tema + '">' +
    '<img src=' + imagen + ' class="ui-li-thumb"/>' +
    '<h2>' + categoria + '</h2>' +
     //'<p>' + descripcion + '</p>' +
    '</a>';
    //console.log(liElemento);
    return liElemento;
}

function CargarProyecto(indice) {

    var contenido = '';
    var proyect_load = {
        type: 'proyects',
        name: indice
    };

    client.getEntity(proyect_load, function (err, proyect) {
        if (err) {
            alert("categories not loaded");
        }
        else {
            proyectoSel = proyect;
            program = proyect.get('program');
            descripcion = proyect.get('Descripcion');
            imagen = proyect.get('Imagen');
            pregunta = proyect.get('Pregunta');
            $('#divTitulo .ui-btn-text').text(program);
            $('#divTituloImg').html('<img src=' + imagen + ' width="100%"/>');
            $('#divPregunta').html(pregunta);
            $('#divDescripcion').html(descripcion);

            contenido += '<ul data-role="listview" id="liOpciones">';


            contenido += ConstruirElementoListaProyecto(1, proyect.get('cat1'),
            		proyect.get('cat1_Descripcion'),
            		proyect.get("cat1IMG"));

            contenido += ConstruirElementoListaProyecto(2, proyect.get('cat2'),
            		proyect.get('cat2_Descripcion'),
            		proyect.get("cat2IMG"));

            contenido += ConstruirElementoListaProyecto(3, proyect.get('cat3'),
            		proyect.get('cat3_Descripcion'),
            		proyect.get("cat3IMG"));

            contenido += ConstruirElementoListaProyecto(4, proyect.get('cat4'),
            		proyect.get('cat4_Descripcion'),
            		proyect.get("cat4IMG"));
            contenido += '</ul>'
            $('#divOpciones').html(contenido);
            $('#divPrograma').trigger("create");
            $('#divTitulo').trigger();
            }
    });
}

$(document).on("pagebeforecreate", "#inicio", function () {
    var inTimeProyects = 0;
    var outTimeProyects = 0;
    var comprobar = -1;
    var proyects = new Usergrid.Collection({ 'client': client, 'type': 'proyects' });
    if (proyects) {
        proyects.resetPaging();
        proyects.fetch(function (err) {
            if (err) {
                $("#divProyectos").html('<div data-role="collapsible" data-collapsed="false" data-content-theme="a"> <h3>No existen proyectos para analizar</h3></div>');
                $('#divProyectos').trigger("create");
            }
            else {
                //Console.log("Cargando Proyectos");
                CrearLista(proyects);
            }
        });
    }
    else {
        $("#divProyectos").html('<div data-role="collapsible" data-collapsed="false" data-content-theme="a"> <h3>No existen proyectos para analizar</h3></div>');
        $('#divProyectos').trigger("create");
    }
    
    if ((userName) && (userCount)) {
        $("#divFooterInicio").html('<b>Hola ' + userName + '. En estos momentos hay ' + userCount + ' analistas en la comunidad.</b>');
    }
   /* else {
        userCount = window.sessionStorage.getItem("numUsuarios");
        userName = window.sessionStorage.getItem("userName");
        $("#divFooterInicio").html('<b>Hola ' + userName + '. En estos momentos hay ' + userCount + ' analistas en la comunidad.</b>');
    }
 */   
   
    $("#lnkCerrarSession").click(function () {
        client.logout();
        if (client.isLoggedIn())
            alert('No se ha podido cerrar session');
        else
            $.mobile.changePage("#login", "slide", false, true);
    });
});

$(document).on("pagecreate", "#inicio", function () {
    
});

$(document).on("pagebeforechange", function (e, data) {
    if (typeof data.toPage === "string") {
        var u = $.mobile.path.parseUrl(data.toPage);
        if (u.hash.indexOf("#verPrograma") >= 0) {
            var programa = $.urlParam(u.href, "id");
            if (programa != -1) {
                id = programa;
                CargarProyecto(programa);
                $.mobile.changePage("#verPrograma", { dataUrl: u.href });
            }
        }
    }
});



$(document).on("pageshow", "#verPrograma", function (e, data) {
    /*    var url = $.url(document.location);
	    var param1 = url.param("id");
	    alert(param1);*/
    console.log("pageshow verPrograma");

});

$(document).on("pagebeforecreate", "#verPrograma", function (e, data) {
    $("#lnkComenzar").click(function () {
        $.mobile.changePage("#registrarResultados", "slide", false, true);
    });
});

$(document).on("pagebeforeshow", "#registrarResultados", function (e, data) {
    var contenido = '';
    if (proyectoSel != null) {
        contenido += '<div data-role="collapsible" data-content-theme="a" data-collapsed="false">' +
                 	 '<h3>' + proyectoSel.get('Pregunta') + '</h3>' +
                 	 '<ul data-role="listview" id="liOpcionesReg">';
        contenido += ConstruirElementoListaResultados(1, proyectoSel.get('cat1'),
        		proyectoSel.get('cat1_Descripcion'),
        		proyectoSel.get("cat1IMG"));
        contenido += ConstruirElementoListaResultados(2, proyectoSel.get('cat2'),
        		proyectoSel.get('cat2_Descripcion'),
        		proyectoSel.get("cat2IMG"));
        contenido += ConstruirElementoListaResultados(3, proyectoSel.get('cat3'),
        		proyectoSel.get('cat3_Descripcion'),
        		proyectoSel.get("cat3IMG"));
        contenido += ConstruirElementoListaResultados(4, proyectoSel.get('cat4'),
        		proyectoSel.get('cat4_Descripcion'),
        		proyectoSel.get("cat4IMG"));
        contenido += '</ul></div>';
        //alert(proyectoSel.get('name'));

        /*
         * 
        
        contenido += '<div data-role="controlgroup" id="divOpcionesReg">';
        contenido += ConstruirBotonListaResultados(1, proyectoSel.get('cat1'),
													proyectoSel.get('cat1_Descripcion'),
													proyectoSel.get("cat1IMG"));
        contenido += ConstruirBotonListaResultados(2, proyectoSel.get('cat2'),
				proyectoSel.get('cat2_Descripcion'),
				proyectoSel.get("cat2IMG"));
        contenido += ConstruirBotonListaResultados(3, proyectoSel.get('cat3'),
				proyectoSel.get('cat3_Descripcion'),
				proyectoSel.get("cat3IMG"));
        contenido += ConstruirBotonListaResultados(4, proyectoSel.get('cat4'),
				proyectoSel.get('cat4_Descripcion'),
				proyectoSel.get("cat4IMG"));
        contenido += '</div>'; */

    }
    else {
        contenido = "<h2>No se han podido recuperar los datos del proyecto</h2>";
    }

    $("#divRegResultados").html(contenido);
    $("#divRegResultados").trigger("create");
    //console.log(contenido);
    //alert(contenido);

    $('#liOpcionesReg li').click(function () {
        //alert('Data-id: ' + $(this).attr('data-id') + ' IdProyecto: ' + id);
        doCheckIn(id, $(this).attr('data-id'));
    });
    
    $('#divOpcionesReg a').click(function () {
        alert('Data-id: ' + $(this).attr('data-id') + ' IdProyecto: ' + id);
        //doCheckIn(id, $(this).attr('data-id'));
    });

});

$(document).on("pagebeforecreate", "#registro", function () {

    if (userCount) {
        $("#divFooterRegistro").html('<h3>En estos momentos hay ' + userCount + ' analistas en la comunidad.</h3>');
    }

    $("#registro #btnSubmitReg").on("touchstart", function (e) {
        e.preventDefault();
        //grab the values
        var user = $("#txtUser").val();
        var email = $("#txtEmail").val();
        var password = $("#txtPasswordReg").val();
        var confirmPassword = $("#txtConfirmPassword").val();
        //alert(password + ' Confirmar: ' + confirmPassword);
        if (password == confirmPassword) {
            if (user) {
                if (email) {
                    if (password) {
                        client.signup(user, password, email, user,
                            function (err, username) {
                                if (err) {
                                    MostrarMensaje('user not created ' + err, true);
                                } else {
                                    console.log('user created');
                                    MostrarMensaje("Usuario creado correctamente", false);
                                    $.mobile.changePage("#login", "slide", false, true);
                                }
                            }
                        );
                    } else {
                        MostrarMensaje("El password no puede estar vacio", true);
                    }
                } else {
                    MostrarMensaje("El Email no puede estar vacio", true);
                }
            } else {
                MostrarMensaje("El nombre de usuario no puede estar vacio", true);
            }
        } else {
            MostrarMensaje("Los Password no coinciden", true);
        }
    });
});

