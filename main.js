import Transaccion from "./clases/transaccion.js";
import Cuenta from "./clases/cuenta.js";
import Inversion from "./clases/inversion.js";

const cuenta = new Cuenta ("Mi cuenta");

const formatoMoneda = new Intl.NumberFormat("es-AR",{
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
});

function cargarTransacciones(){
    const datosGuardados = localStorage.getItem("transacciones");

    if(datosGuardados){
        const datos = JSON.parse(datosGuardados);

        datos.forEach(datosTransaccion => {
            const transaccion = new Transaccion(
                datosTransaccion.monto,
                datosTransaccion.tipo,
                datosTransaccion.categoria,
                datosTransaccion.fecha,
                datosTransaccion.descripcion
            );
            cuenta.aggTransaccion(transaccion);
        });
    }
}

function guardarTransacciones(){
    const datos = cuenta.transacciones.map(t => ({
        monto: t.monto,
        tipo: t.tipo,
        categoria: t.categoria,
        fecha: t.fecha,
        descripcion: t.descripcion
    }));
    localStorage.setItem("transacciones", JSON.stringify(datos));
}

function actualizarResumen(){
    const ingresos = cuenta.calcularIngresos();
    const gastos = cuenta.calcularGastos();
    const balance = cuenta.calcularBalance();

    document.getElementById("ingresos").textContent = formatoMoneda.format(ingresos);
    document.getElementById("gastos").textContent = formatoMoneda.format(gastos);
    document.getElementById("balance").textContent = formatoMoneda.format(balance);
}

function obtenerTransaccionesFiltradas(){
    const fechaDesde = document.getElementById("fecha-desde").value;
    const fechaHasta = document.getElementById("fecha-hasta").value;
    const categoria = document.getElementById("filtro-categoria").value;
    const montoMin = document.getElementById("monto-minimo").value;
    const montoMax = document.getElementById("monto-maximo").value;

    return cuenta.transacciones.map((transaccion, indice) => ({transaccion, indice})).filter(({transaccion}) => {
        if (fechaDesde && transaccion.fecha < fechaDesde){
            return false;
        }
        if (fechaHasta && transaccion.fecha > fechaHasta){
            return false;
        }
        if (categoria && transaccion.categoria.trim().toLowerCase() !== categoria.trim().toLowerCase()){
            return false;
        }
        if (montoMin !== "" && transaccion.monto < Number(montoMin)){
            return false;
        }
        if ( montoMax !== "" && transaccion.monto > Number(montoMax)){
            return false;
        }
        return true;
    });
}

function actualizarOpcionesCategoria(){
    const selector = document.getElementById("filtro-categoria");
    const categoriaSeleccionada = selector.value;

    const categorias = [
        ...new Set (cuenta.transacciones.map(transaccion => transaccion.categoria.trim()))
    ];

    selector.innerHTML = '<option value="">Todas las categorias</option>';
    categorias.sort((a,b) => a.localeCompare(b));

    categorias.forEach(categoria => {
        const opcion = document.createElement("option");
        opcion.value = categoria
        opcion.textContent = categoria;
        selector.appendChild(opcion);
    });

    if (categorias.includes(categoriaSeleccionada)){
        selector.value = categoriaSeleccionada;
    }
}

function mostrarTransacciones() {
    const lista = document.getElementById("transacciones");

    lista.innerHTML = "";

    const transaccionesFiltradas = obtenerTransaccionesFiltradas();
    
    if (transaccionesFiltradas.length === 0) {
        const mensaje = document.createElement("li");
        mensaje.textContent = "No hay movimientos que coincidan con los filtros.";
        lista.appendChild(mensaje);
        return;
    }

    transaccionesFiltradas.forEach(({ transaccion, indice }) => {
        const elemento = document.createElement("li");
        elemento.textContent =
            `${transaccion.fecha} | ${transaccion.categoria} | ` +
            `${transaccion.tipo} | ${formatoMoneda.format(transaccion.monto)}`;

        if (transaccion.descripcion) {
            elemento.textContent += ` | ${transaccion.descripcion}`;
        }

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";

        botonEliminar.addEventListener("click",() => {
            cuenta.eliminarTransaccion(indice);

            guardarTransacciones();
            actualizarOpcionesCategoria();
            mostrarTransacciones();
            actualizarResumen();
            actualizarGraficos();
        });
        elemento.appendChild(botonEliminar);
        lista.appendChild(elemento);
    })
}

function mostrarGraficoCategorias(){
    const contenedor = document.getElementById("graf-categorias");
    contenedor.innerHTML = "";

    const transacciones = obtenerTransaccionesFiltradas();
    const gastosXcategoria = {};

    transacciones.forEach(({transaccion}) => {
        if (transaccion.tipo === "gasto"){
            const categoria = transaccion.categoria;

            if (!gastosXcategoria[categoria]){
                gastosXcategoria[categoria] = 0;
            }

            gastosXcategoria[categoria] += transaccion.monto;
        }
    });

    const categorias = Object.entries(gastosXcategoria);

    if (categorias.length === 0){
        contenedor.textContent = "NO hay gastos para mostrar"
        return;
    }
    const gastoMaximo = Math.max(...categorias.map(([,monto]) => monto));
    categorias.sort((a,b) => b[1] - a[1]);

    categorias.forEach(([categoria,monto]) => {
        const fila = document.createElement("div");
        fila.className = "fila-categoria"

        const etiqueta = document.createElement("p");
        etiqueta.textContent = `${categoria}: ${formatoMoneda.format(monto)}`;

        const barra = document.createElement("div");
        barra.className = "barra-categoria";

        const relleno = document.createElement("div");
        relleno.className = "barra-relleno";

        relleno.style.width = `${(monto = gastoMaximo)*100}%`;

        barra.appendChild(relleno);
        fila.appendChild(etiqueta);
        fila.appendChild(barra);
        contenedor.appendChild(fila);
    });
}

function mostrarGraficoBalance(){
    const contenedor = document.getElementById("graf-balance");
    contenedor.innerHTML = "";
    
    const fechaDesde = document.getElementById("fecha-desde").value;
    const fechaHasta = document.getElementById("fecha-hasta").value;

    const transaccionesOrdenadas = [...cuenta.transacciones].sort((a,b) => a.fecha.localeCompare(b.fecha));

    let balanceAcum = 0;
    const balanceXfecha = new Map();

    transaccionesOrdenadas.forEach(transaccion => {
        balanceAcum += transaccion.obtenerImporteFirmado();

    const dentroRango = 
        (!fechaDesde || transaccion.fecha >= fechaDesde) &&
        (!fechaHasta || transaccion.fecha <= fechaHasta);

        if(dentroRango){
            balanceXfecha.set(transaccion.fecha, balanceAcum);
        }
    });

    const datos = [...balanceXfecha.entries()];
    if(datos.length === 0){
        contenedor.textContent="no hay movimientos en el rango de fechas solicitaodo";
        return;
    }

    const balanceMax = Math.max(...datos.map(([,balance]) => Math.abs(balance)),1);

    datos.forEach(([fecha, balance]) => {
        const columna = document.createElement("div");
        columna.className = "columna-balance";

        const valor = document.createElement("p");
        valor.textContent = formatoMoneda.format(balance);

        const barra = document.createElement("div");
        barra.className = "barra-balance";

        barra.style.height = `${(Math.abs(balance)/balanceMax)*100}%`;

        if (balance<0){
            barra.classList.add("balance-negativo");
        }else{
            barra.classList.add("balance-positivo");
        }
        barra.title = `${fecha}: ${formatoMoneda.format(balance)}`;

        const etiqueta = document.createElement("small");
        etiqueta.textContent = fecha;

        columna.appendChild(valor);
        columna.appendChild(barra);
        columna.appendChild(etiqueta);
        contenedor.appendChild(columna);
    })
}

function actualizarGraficos(){
    mostrarGraficoCategorias();
    mostrarGraficoBalance();
}

const formulario = document.getElementById("form-transaccion");
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const monto = document.getElementById("monto").value;
    const tipo = document.getElementById("tipo").value;
    const categoria = document.getElementById("categoria").value;
    const fecha = document.getElementById("fecha").value;
    const descripcion = document.getElementById("descripcion").value;

    const nuevaTransaccion = new Transaccion(
        monto,
        tipo,
        categoria,
        fecha,
        descripcion
    );

    if(!nuevaTransaccion.validar()){
        alert ("Por favor, ingrese datos valdios.");
        return
    }

    cuenta.aggTransaccion(nuevaTransaccion);

    guardarTransacciones();
    mostrarTransacciones();
    actualizarResumen();

    formulario.reset();
})




const formularioInversion = document.getElementById("form-inversion");
formularioInversion.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const capitalInicial = Number(document.getElementById("capital-inicial").value);
    const aporteMensual = Number(document.getElementById("aporte-mensual").value);
    const tasaAnual = Number(document.getElementById("tasa-anual").value);
    const plazo = Number(document.getElementById("plazo").value);

    if(
        !Number.isFinite(capitalInicial) ||
        !Number.isFinite(aporteMensual) ||
        !Number.isFinite(tasaAnual) ||
        !Number.isInteger(plazo) ||
        capitalInicial < 0 ||
        aporteMensual < 0 ||
        tasaAnual < 0 ||
        plazo <= 0
    ){
        alert("Por favor, ingrese valores validos");
        return
    }

    const inversion = new Inversion (
        capitalInicial,
        aporteMensual,
        tasaAnual,
        plazo
    );

    const resultado = inversion.calcularProyeccion();
    document.getElementById("capital-final").textContent = formatoMoneda.format(resultado.capitalFinal);
    document.getElementById("aportes-totales").textContent = formatoMoneda.format(resultado.aportesTotales);
    document.getElementById("intereses-estimados").textContent = formatoMoneda.format(resultado.interesesEstimados);
});

const camposFiltro = [
    "fecha-desde",
    "fecha-hasta",
    "filtro-categoria",
    "monto-minimo",
    "monto-maximo"
];

camposFiltro.forEach(id => {
    const campo = document.getElementById(id);

    campo.addEventListener("input" , () => {
        mostrarTransacciones();
        actualizarGraficos();
    });

    campo.addEventListener("change", () => {
        mostrarTransacciones();
        actualizarGraficos();
    });
});

document.getElementById("limpiar-filtros").addEventListener("click", () => {
    document.getElementById("fecha-desde").value = "";
    document.getElementById("fecha-hasta").value = "";
    document.getElementById("filtro-categoria").value = "";
    document.getElementById("monto-minimo").value = "";
    document.getElementById("monto-maximo").value = "";

    mostrarTransacciones();
    actualizarGraficos();
})

cargarTransacciones();
actualizarOpcionesCategoria();
mostrarTransacciones();
actualizarResumen();
actualizarGraficos();