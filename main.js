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

function mostrarTransacciones() {
    const lista = document.getElementById("transacciones");

    lista.innerHTML = "";

    cuenta.transacciones.forEach((transaccion, indice) => {

        const elemento = document.createElement("li");

        elemento.textContent =
            `${transaccion.fecha} | ${transaccion.categoria} | ` +
            `${transaccion.tipo} | ${formatoMoneda.format(transaccion.monto)}`;

        if (transaccion.descripcion) {
            elemento.textContent += ` | ${transaccion.descripcion}`;
        }

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";

        botonEliminar.addEventListener("click", () => {
            cuenta.eliminarTransaccion(indice);

            guardarTransacciones();
            mostrarTransacciones();
            actualizarResumen();
        });
        elemento.appendChild(botonEliminar);
        lista.appendChild(elemento);
    });
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

cargarTransacciones();
mostrarTransacciones();
actualizarResumen();


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

})
