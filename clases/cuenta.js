//administracion de transacciones y calculo de balances
export default class Cuenta {
    #nombre;
    #transacciones;

    constructor(nombre = "Mi cuenta"){
        this.#nombre = nombre;
        this.#transacciones = [];
    }

    get nombre(){
        return this.#nombre;
    }

    get transacciones(){
        return [...this.#transacciones];
    }

    aggTransaccion(transaccion){
        if (!transaccion.validar()){
            throw new Error("La transaccion no es valida.");
        }

        this.#transacciones.push(transaccion);
    }

    eliminarTransaccion(indice){
        if (!Number.isInteger(indice) || indice < 0 || indice >= this.#transacciones.length){
            return false;
        }

        this.#transacciones.splice(indice,1);
        return true;
    }

    calcularIngresos(){
        return this.#transacciones
        .filter(t => t.tipo === "ingreso")
        .reduce((total,t) => total + t.monto, 0);
    }

    calcularGastos(){
        return this.#transacciones
        .filter(t => t.tipo === "gasto")
        .reduce((total,t) => total + t.monto, 0);
    }

    calcularBalance(){
        return this.#transacciones
        .reduce((total,t) => total + t.obtenerImporteFirmado(), 0);
    }
}