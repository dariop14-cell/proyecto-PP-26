//representacion de ingresos y gastos
export default class Transaccion {
    #monto;
    #tipo;
    #categoria;
    #fecha;
    #descripcion;

    constructor(monto, tipo, categoria, fecha, descripcion = ""){
        this.#monto = Number(monto);
        this.#tipo = tipo;
        this.#categoria = categoria;
        this.#fecha = fecha;
        this.#descripcion = descripcion;
    }

    get monto(){
        return this.#monto;
    }

    get tipo(){
        return this.#tipo
    }

    get categoria(){
        return this.#categoria;
    }

    get fecha(){
        return this.#fecha;
    }

    get descripcion(){
        return this.#descripcion
    }

    validar(){
        return (
            Number.isFinite(this.#monto) && this.#monto > 0 && ["ingreso", "gasto"].includes(this.#tipo) && 
            typeof this.#categoria === "string" && this.#categoria.trim() !== "" && this.#fecha !== "" 
        );
    }

    obtenerImporteFirmado(){
        return this.#tipo === "ingreso" 
        ? this.#monto
        : -this.#monto
    }
}