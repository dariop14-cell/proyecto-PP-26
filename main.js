import Transaccion from "./clases/transaccion.js";
import Cuenta from "./clases/cuenta.js";
import Inversion from "./clases/inversion.js";

const cuenta = new Cuenta ("Mi cuenta");

const ingreso = new Transaccion(
    250000,
    "ingreso",
    "Sueldo",
    "2026-10-30",
    "Ingreso mensual"
); 

const gasto = new Transaccion(
    45000,
    "gasto",
    "Comida",
    "2026-10-30",
    "Compra de alimentos"
);

const ingresos = cuenta.calcularIngresos();
const gastos = cuenta.calcularGastos();
const balance = cuenta.calcularBalance();

const formatoMoneda = new Intl.NumberFormat("es-AR",{
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
});

document.getElementById("ingresos").textContent = formatoMoneda.format(ingresos);
document.getElementById("gastos").textContent = formatoMoneda.format(gastos);
document.getElementById("balance").textContent = formatoMoneda.format(balance);


const inversion = new Inversion (
    50000, //capital inicial
    10000, //aporte mensual
    8, //tasa anual en porcemtaje
    10 //paloz en años
);

const resultado = inversion.calcularProyeccion()

console.log ("resultado de la inversion: ");
console.log("Capital final: ",formatoMoneda.format(resultado.capitalFinal));
console.log("Aportes totales: ", formatoMoneda.format(resultado.aportesTotales));
console.log("Intereses estimados: ",formatoMoneda.format(resultado.interesesEstimados));

