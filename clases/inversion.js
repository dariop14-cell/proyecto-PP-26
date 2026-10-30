//calculo de evolucion estimada de la inversión 
export default class Inversion {
    #capitalInicial;
    #aporteMensual;
    #tasaAnual;
    #plazoAnios;

    constructor(capitalInicial, aporteMensual, tasaAnual, plazoAnios){
        this.#capitalInicial = Number(capitalInicial);
        this.#aporteMensual = Number(aporteMensual);
        this.#tasaAnual = Number(tasaAnual);
        this.#plazoAnios = Number(plazoAnios);
    }

    get capitalInicial(){
        return this.#capitalInicial;
    }

    get aporteMensual(){
        return this.#aporteMensual;
    }

    get tasaAnual(){
        return this.#tasaAnual;
    }

    get plazoAnios(){
        return this.#plazoAnios;
    }

    validar(){
        return (Number.isFinite(this.#capitalInicial) && this.#capitalInicial >= 0 &&

        Number.isFinite(this.#aporteMensual) && this.#aporteMensual >= 0 &&

        Number.isFinite(this.#tasaAnual) && this.#tasaAnual >= 0 &&

        Number.isFinite(this.#plazoAnios) && this.#plazoAnios > 0
    );
    }

    calcularProyeccion(){
        if (!this.validar()){
            throw new Error ("Los datos de la inversion no son validos");
        }

        const tasaMensual = Math.pow(1 + this.#tasaAnual / 100, 1 / 12) -1;

        let capital = this.#capitalInicial;
        const meses = Math.round(this.#plazoAnios * 12);

        for (let mes = 0; mes < meses; mes++){
            capital = capital * (1+tasaMensual) + this.#aporteMensual;
        }

        const aportesTotales = this.#capitalInicial + this.#aporteMensual * meses;

        return {
            capital: capital,
            aportesTotales: aportesTotales,
            interesesEstimados: capital - aportesTotales
        }
    }
}