class JogoPlataforma extends JS_CG_2D_API {
    acaoAoIniciar() {
        this.teclas = { esquerda: false, direita: false };
        this.velocidade = 4;

        this.plataformas = [
            new Retangulo2D(0, 550, 3000, 50),   // Chão compridão
            new Retangulo2D(150, 450, 100, 20),
            new Retangulo2D(350, 350, 100, 20),
            new Retangulo2D(550, 250, 100, 20),
            new Retangulo2D(750, 400, 150, 20),
            new Retangulo2D(1050, 300, 100, 20),
            new Retangulo2D(1350, 200, 100, 20),
            new Retangulo2D(-20, 0, 20, 600),    // Parede invisível esquerda
            new Retangulo2D(3000, 0, 20, 600)    // Parede invisível direita
        ];

        this.jogador = new Personagem(50, 400, 30, 30, this.plataformas);
        this.jogador.setForcaPulo(-13); 
        this.jogador.setGravidade(0.7); 

        this.cameraX = 0;
    }

    teclaPressionada(e) {
        if (e.key === "a" || e.key === "ArrowLeft") this.teclas.esquerda = true;
        if (e.key === "d" || e.key === "ArrowRight") this.teclas.direita = true;
        
        if (e.key === "w" || e.key === "ArrowUp" || e.key === " ") {
            this.jogador.pular();
        }
    }

    teclaLiberada(e) {
        if (e.key === "a" || e.key === "ArrowLeft") this.teclas.esquerda = false;
        if (e.key === "d" || e.key === "ArrowRight") this.teclas.direita = false;
    }

    atualizar(dt) {
        if (this.teclas.esquerda) this.jogador.x -= this.velocidade;
        if (this.teclas.direita) this.jogador.x += this.velocidade;

        this.jogador.atualizar();
        
        // Se cair, volta pro início
        if (this.jogador.y > this.alturaTela()) {
            this.jogador.x = 50;
            this.jogador.y = 50;
            this.jogador.velY = 0; 
        }

        // Câmera segue o jogador
        this.cameraX = this.jogador.x - (this.larguraTela() / 2) + (this.jogador.w / 2);
        if (this.cameraX < 0) {
            this.cameraX = 0;
        }
    }

    desenhar() {
        this.limparTela("#87CEEB");

        this.empilhar();
        this.transladar(-this.cameraX, 0);

        this.preenchimento("#228B22"); 
        this.contorno(2, "#006400");
        for (let plat of this.plataformas) {
            this.retangulo(plat.x, plat.y, plat.largura, plat.altura, Estilo.PREENCHIDO);
            this.retangulo(plat.x, plat.y, plat.largura, plat.altura, Estilo.LINHAS);
        }

        this.preenchimento("#FF0000"); 
        this.contorno(2, "#8B0000");
        this.retangulo(this.jogador.x, this.jogador.y, this.jogador.w, this.jogador.h, Estilo.PREENCHIDO);
        this.retangulo(this.jogador.x, this.jogador.y, this.jogador.w, this.jogador.h, Estilo.LINHAS);

        this.desempilhar();

        this.preenchimento("white");
        this.gc.font = "bold 18px 'Courier New', monospace";
        this.gc.fillText("Use A/D para mover | W ou Espaço para pular", 10, 30);
    }
}

window.addEventListener("load", () => {
    new JogoPlataforma("Super Exemplo Bros", "gameCanvas", 800, 600, 60);
});