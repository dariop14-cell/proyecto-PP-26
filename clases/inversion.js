//calculo de evolucion estimada de la inversión 
export default class Inversion {
    #capitalInicial;
    #aporteMensual;
    #tasaAnual;
    #plazoAnios;

    constructor(capitalInicial, aporteMensual, tasaAnual, plazoAnios) {
        this.#capitalInicial = Number(capitalInicial);
        this.#aporteMensual = Number(aporteMensual);
        this.#tasaAnual = Number(tasaAnual);
        this.#plazoAnios = Number(plazoAnios);
    }

    calcularProyeccion() {
        const tasaMensual = Math.pow(1 + this.#tasaAnual / 100, 1 / 12) - 1;

        const cantidadMeses = this.#plazoAnios * 12;

        let capitalInicialProyectado;
        let aportesProyectados;

        if (tasaMensual === 0) {
            capitalInicialProyectado = this.#aporteMensual * cantidadMeses;
        } else {
            capitalInicialProyectado = this.#capitalInicial * Math.pow(1 + tasaMensual, cantidadMeses);

            aportesProyectados = this.#aporteMensual * (Math.pow(1 + tasaMensual, cantidadMeses) - 1) / tasaMensual;
        }

        const capitalFinal = capitalInicialProyectado + aportesProyectados;

        const aportesTotales = this.#capitalInicial + this.#aporteMensual * cantidadMeses;

        const interesesEstimados = capitalFinal - aportesTotales;

        return{
            capitalFinal,
            aportesTotales,
            interesesEstimados
        };
    }
}