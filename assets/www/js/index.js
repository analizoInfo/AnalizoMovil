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
        }
    });
}

$(document).on("mobileinit", function () {
    $.mobile.defaultPageTransition = "slide";
    $.mobile.transitionFallbacks.slideout = "none";
});

function CrearLista(data) {
    var enEmision = [];
    var enFuturo = [];
    data.resetEntityPointer();
    while (data.hasNextEntity()) {
        var proyect = data.getNextEntity();
        enEmision.push(proyect);
    }

    var lEnEmision;
    if (enEmision.length > 0) {
        lEnEmision = '<ul data-role="listview"><li data-role="list-divider">Ahora puedes analizar</li>';
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
        lEnEmision += '</ul>';
    }
    else
        lEnEmision = '<ul data-role="listview"><li data-role="list-divider">No existen proyectos para analizar en este horario</li></ul>';

    var lEnFuturo;
    if (enFuturo.length > 0) {
        lEnFuturo = '<ul data-role="listview"><li data-role="list-divider">Proximos analis</li>';
        for (var i = 0; i < enFuturo.length; i++) {
            var pro = enFuturo[i];
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
        lEnFuturo += '</ul>';
    }
    else
        lEnFuturo = '<ul data-role="listview"><li data-role="list-divider">No existen proyectos proximamente</li></ul>';

    $("#divProyectos").html(lEnEmision + lEnFuturo);
    $('#divProyectos').trigger("create");
}

function showError(err) {
    $("#errorL").empty();
    $("#errorL").append(err);
    $("#errorL").css('background-color', '#c13d3d');
    $("#errorL").fadeIn();
    setTimeout(function () { $("#errorL").fadeOut(); }, 2000);
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
        //alert(userName);
        $.mobile.changePage("#inicio", "slide", false, true);
    }
    else {
        client.logout();
       client.login(usuario, pasword,
			function (err) {
			    if (err) {
			        alert('El usuario o contraseña no son correctos');
			    }
			    else {
			        var token = client.token;
			        
			        client.getLoggedInUser(function (err, data, user) {
			            if (err) {
			                alert(err);
			            } else {
			            	
			                userName = user.get('username');
			                if (rec) {
			                    window.localStorage.setItem('username', userName);
			                    //alert(window.localStorage.getItem('username'));
			                }
			                $.mobile.changePage("#inicio", "slide", false, true);
			            }
			        });

			    }
			}
	    );
    }
}
/*
function doCheckIn(indice, categoria) {
    //$("#alerta").fadeIn();

    var proyect_load = {
        type: 'proyects',
        name: indice
    };

    now = new Date();
    client.getEntity(proyect_load, function (err, proyecto) {
        if (err) {

        }
        else {
            var hora = '';
            var inicio_p = '';
            var fin_p = '';
            if (now.getMinutes() < 10) { hora = '' + now.getHours() + '0' + now.getMinutes() }
            else { hora = '' + now.getHours() + '' + now.getMinutes() }
            inicio_p = '' + proyecto.get('HoraInicio') + '' + proyecto.get('MinutoInicio');
            fin_p = '' + proyecto.get('HoraFin') + '' + proyecto.get('MinutoFin');
            if (parseInt(hora) >= parseInt(inicio_p)) {
                if (parseInt(hora) <= parseInt(fin_p)) {
                    client.getEntity(proyect_load, function (err, proyecto) {
                        if (err) {

                        }
                        else {
                            //aqui
                            var resultados = proyecto.get('Resultados');
                            var options = {
                                type: resultados
                            }
                            client.createCollection(options, function (err, checkin) {
                                if (err) {
                                    error('could not make collection');
                                }
                                else {
                                    //success('new Collection created');
                                    now = new Date();
                                    //create a new dog and add it to the collection
                                    var options = {
                                        name: now.toString() + '-' + proyecto.get('name') + '-' + userName,
                                        categoria: category,
                                        proyecto: proyecto.get('name'),
                                        hora: now.getHours(),
                                        minuto: now.getMinutes(),
                                        segundo: now.getSeconds(),
                                        mes: now.getMonth(),
                                        año: now.getFullYear(),
                                        dia: now.getDate(),
                                        diaSemana: now.getDay(),
                                        fecha: now.toString(),
                                        usuario: userName
                                    }
                                    //just pass the options to the addEntity method
                                    //to the collection and it is saved automatically
                                    checkin.addEntity(options, function (err, last, data) {
                                        if (err) {
                                            error('extra dog not saved or added to collection');
                                        }
                                        else {
                                            var results = proyecto.get('cat' + categoria + '_results');
                                            results = parseInt(results) + 1;
                                            proyecto.set('cat' + categoria + '_results', results);
                                            proyecto.save(function (err) {
                                                if (err) {
                                                    //error('proyect not saved');
                                                }
                                                else {
                                                    //success('proyect is saved');
                                                    alert('Checked In');
                                                    //$("#alerta").fadeOut();
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else { showError("El programa ha terminado.") }
            } else { showError("El programa ha terminado.") }
        }
    });
}
*/
$(document).on("pagebeforecreate", "#login", function () {
    /*if(window.localStorage.getItem('username')){
		var userName = window.localStorage.getItem('username');
		alert(userName);
		var opciones = {
			    type:'user',
			    name:userName
			};
		client.getEntity(opciones, function(err, usuario){
	 		if (err){
	 			
	 		} else {
	 			var proyect_day = usuario.get(now_day); 
	 			LogearUsuario(usuario.get('Name'), usuario.get('Name'));
	 		}
		});
	} 
	var token =client.getToken();
	if(token){
		alert(token);
		$.mobile.changePage("#inicio", "slide", false, true);
	}
	*/
    if (window.localStorage.getItem('username')) {
        /*
		if(client.isLoggedIn()){
			alert('logeado');
				$.mobile.changePage("#inicio", "slide", false, true);
		}
		else
			alert('No logeado');
			*/
    }


    $("#login #btnSubmit").click(function () {
        var login = $("#txtLogin").val();
        var pwd = $("#txtPassword").val();
        var rec = $("#chkRecordar").val();

        LogearUsuario(login, pwd, rec);
    });
});

function ConstruirElementoLista(id, categoria, descripcion, imagen) {
    var liElemento = '<li data-id=' + id + '>' +
    //'<a href="#verPrograma?id=' + categoria + '">' +
	'<a>' +
    '<img src=' + imagen + ' class="ui-li-thumb"/>' +
    '<h3>' + categoria + '</h3>' +
     '<p>' + descripcion + '</p>' +
    '</a>' +
    '</li>';
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
            $('#divTitulo').html(program);
            $('#divPregunta').html(pregunta);
            $('#divDescripcion').html(descripcion);

            // $("#divPrograma .divProgramaBG").css('background-image', 'url(' + imagen + ')');

            contenido += '<ul data-role="listview" id="liOpciones">';


            contenido += ConstruirElementoLista(1, proyect.get('cat1'),
            		proyect.get('cat1_Descripcion'),
            		proyect.get("cat1IMG"));

            contenido += ConstruirElementoLista(2, proyect.get('cat2'),
            		proyect.get('cat2_Descripcion'),
            		proyect.get("cat2IMG"));

            contenido += ConstruirElementoLista(3, proyect.get('cat3'),
            		proyect.get('cat3_Descripcion'),
            		proyect.get("cat3IMG"));

            contenido += ConstruirElementoLista(4, proyect.get('cat4'),
            		proyect.get('cat4_Descripcion'),
            		proyect.get("cat4IMG"));
            contenido += '</ul>'
            $('#divOpciones').html(contenido);
            $('#divOpciones').trigger("create");

            //$('#divPrograma').trigger("create");

            /*
             $("#redC").append(proyect.get('cat1'));
            $("#greenC").append(proyect.get('cat2'));
            $("#yellowC").append(proyect.get('cat3'));
            $("#blueC").append(proyect.get('cat4'));

            question = proyect.get('Pregunta');
            $("#descripcionP").append("<img src='images/botones/info.png' width='13px' /> información sobre el proyecto");
            $("#okinfotext").append("comenzar");
            $("#infoDescTitulo2").append(proyect.get('program'));
            $("#infoDescPregunta2").append(question);
            $("#infoDesc").append(proyect.get('Descripcion'));
            $("#redInfo").append(proyect.get('cat1') + "</br><span id='redInfoDesc'>" + proyect.get('cat1_Descripcion') + "</span>");
            $("#yellowInfo").append(proyect.get('cat2') + "</br><span id='yellowInfoDesc'>" + proyect.get('cat2_Descripcion') + "</span>");
            $("#greenInfo").append(proyect.get('cat3') + "</br><span id='greenInfoDesc'>" + proyect.get('cat3_Descripcion') + "</span>");
            $("#blueInfo").append(proyect.get('cat4') + "</br><span id='blueInfoDesc'>" + proyect.get('cat4_Descripcion') + "</span>");

            $("#redInfoIMG").css('background-image', 'url(' + proyect.get("cat1IMG") + ')');
            $("#greenInfoIMG").css('background-image', 'url(' + proyect.get("cat2IMG") + ')');
            $("#yellowInfoIMG").css('background-image', 'url(' + proyect.get("cat3IMG") + ')');
            $("#blueInfoIMG").css('background-image', 'url(' + proyect.get("cat4IMG") + ')'); 
             
           contenido = '<div data-role="collapsible" data-collapsed="false">' +
		                    '<h3>Titulo</h3>' +
		                    '<div>' + pregunta + '</div>' +
		                '</div>';
           
           contenido += '<div data-role="collapsible" data-collapsed="false">' +
			           '<h3>Descripci&oacute;n</h3>' +
			           '<div>' + descripcion + '</div>' +
			       '</div>';
            
           
            contenido = '<a href="#verPrograma?id=' + name + '">' +
				            '<img src=' + imagen + ' height="100"/>' +
				            '<h3>' + descripcion + '</h3>' +
				             '<p>' + pregunta + '</p>' +
				         '</a>'
            
            contenido += '<ul data-role="listview"><li data-role="list-divider">Titulo</li>';
            contenido += '<li>' + program + '</li>';
            contenido += '<li data-role="list-divider">¿ Qu&eacute; analizamos?</li>';
            contenido += '<li>' + pregunta + '</li>';
            contenido += '<li data-role="list-divider">Descripci&oacute;n</li>';
            contenido += '<li>' + descripcion + '</li>';
            contenido += '</ul>'; */
            //$('#infoDesc').html(descripcion);

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
                $("#divProyectos").html("No existen proyectos");
                $('#divProyectos').trigger("create");
            }
            else {
                //Console.log("Cargando Proyectos");
                CrearLista(proyects);
            }
        });
    }
    else {
        $("#divProyectos").html("No existen proyectos");
        $('#divProyectos').trigger("create");
    }
    if ((userName) && (userCount)) {
        $("#divFooterInicio").html('<b>Hola ' + userName + '. En estos momentos hay ' + userCount + ' analistas en la comunidad.</b>');
    }

    $("#lnkCerrarSession").click(function () {
        client.logout();
        if (client.isLoggedIn())
            alert('No se ha podido cerrar session');
        else
            $.mobile.changePage("#login", "slide", false, true);
    });

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


});

$(document).on("pagebeforecreate", "#verPrograma", function (e, data) {
    $("#lnkComenzar").click(function () {
        $.mobile.changePage("#registrarResultados", "slide", false, true);
    });
});

$(document).on("pagebeforecreate", "#registrarResultados", function (e, data) {
    var contenido = '';
    if (proyectoSel != null) {
        contenido += '<div data-role="collapsible" data-collapsed="false">' +
                 	 '<h3>' + proyectoSel.get('program') + '</h3>' +
                 	 '<ul data-role="listview" id="liOpcionesReg">' +
                 	 '<li data-role="list-divider">' +proyectoSel.get('Pregunta') + '</li>';
        contenido += ConstruirElementoLista(1, proyectoSel.get('cat1'),
        		proyectoSel.get('cat1_Descripcion'),
        		proyectoSel.get("cat1IMG"));
        contenido += ConstruirElementoLista(2, proyectoSel.get('cat2'),
        		proyectoSel.get('cat2_Descripcion'),
        		proyectoSel.get("cat2IMG"));
        contenido += ConstruirElementoLista(3, proyectoSel.get('cat3'),
        		proyectoSel.get('cat3_Descripcion'),
        		proyectoSel.get("cat3IMG"));
        contenido += ConstruirElementoLista(4, proyectoSel.get('cat4'),
        		proyectoSel.get('cat4_Descripcion'),
        		proyectoSel.get("cat4IMG"));
        contenido += '</ul></div>';

    }
    else {
        contenido = "<h2>No se han podido recuperar los datos del proyecto</h2>";
    }

    $("#divRegResultados").html(contenido);
    //$("#divRegResultados").trigger("create");
    //console.log(contenido);
    alert(contenido);
    
    $('#liOpcionesReg li').click(function () {
        alert('Data-id: ' + $(this).attr('data-id') + ' IdProyecto: ' + id);
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
        alert(password + ' Confirmar: ' + confirmPassword);
        if (password == confirmPassword) {
            client.signup(user, password, email, user,
    			function (err, username) {
    			    if (err) {
    			        alert('user not created ' + err);
    			    } else {
    			        alert('user created');

    			    }
    			}
    		);
        } else {
            alert("Las contraseñas no coinciden");
        }
    });
});

