class MeuJogo extends JS_CG_2D_API {
    acaoAoIniciar() {
        this.fundo = new Image();
        this.fundo.src = "imagens/fundo1.png"; 

        this.plataformas = [
            new Retangulo2D(0, 240, 3000, 48),   
            new Retangulo2D(120, 180, 80, 16),    
            new Retangulo2D(250, 130, 80, 16),  
            new Retangulo2D(-20, 0, 20, 288),    
            new Retangulo2D(3000, 0, 20, 288)     
        ];

        this.fjogador = new Personagem(50, 150, 16, 32, this.plataformas);
        this.fjogador.setGravidade(0.5);
        this.fjogador.setForcaPulo(-10);

        this.jogador = new Sprite(50, 150, 16, 32);
        let frames = this.carregarFrames("player", 20, "imagens");

        this.animacoes = {
            parado: {
                esquerda: [frames[3]],
                direita:  [frames[0]]
            },
            andando: {
                esquerda: [frames[9], frames[10]],
                direita:  [frames[2], frames[1]]
            },
            subindo: {
                esquerda: [frames[11]],
                direita: [frames[4]]
            },
            caindo: {
                esquerda: [frames[12]],
                direita: [frames[5]]
            },
            cima: {
                esquerda: [frames[13]],
                direita: [frames[6]]
            },
            baixo: {
                esquerda: [frames[14]],
                direita: [frames[8]]
            }
            
        };

        this.direcao = "direita";
        this.estado = "parado";
        this.jogador.setAnimacao(this.animacoes.parado.direita);
        this.jogador.delayAnimacao = 10;

        this.teclas = { a: false, d: false, w: false };
        this.velocidadeAndando = 2;
        this.cameraX = 0;
    }

    teclaPressionada(e) {
        if (e.key === "a" || e.key === "ArrowLeft") this.teclas.a = true;
        if (e.key === "d" || e.key === "ArrowRight") this.teclas.d = true;
        if (e.key === "w" || e.key === "ArrowUp")  this.teclas.w = true;

        if (e.key === " ") {
            this.fjogador.pular();
        }
    }

    teclaLiberada(e) {
        if (e.key === "a" || e.key === "ArrowLeft") this.teclas.a = false;
        if (e.key === "d" || e.key === "ArrowRight") this.teclas.d = false;
        if (e.key === "w" || e.key === "ArrowUp") this.teclas.w = false;
    }

    atualizar(dt) {

        
    if (this.teclas.a) {
        this.fjogador.x -= this.velocidadeAndando;
        this.direcao = "esquerda";
    } else if (this.teclas.d) {
        this.fjogador.x += this.velocidadeAndando;
        this.direcao = "direita";
    }
    if (!this.fjogador.isNoChao()) {
        if (this.fjogador.velY < 0) {
            this.estado = "subindo";
        } 
        else {
            this.estado = "caindo";
        }
    } else {
       if (this.teclas.w) {
            this.estado = "cima";
        } 
        else if (this.teclas.a || this.teclas.d) {
            this.estado = "andando";
        } else {
            this.estado = "parado";
        }
    }

    this.fjogador.atualizar();

    this.jogador.px = this.fjogador.x;
    this.jogador.py = this.fjogador.y;
    this.jogador.setAnimacao(this.animacoes[this.estado][this.direcao]);
    this.jogador.atualizar();
    this.cameraX = this.fjogador.x - (this.larguraTela() / 2) + (this.fjogador.w / 2);
    if (this.cameraX < 0) this.cameraX = 0;
}

    desenhar() {
        this.limparTela("#F5F9DF");
        this.empilhar();
        this.transladar(-this.cameraX, 0);

        let larguraFundo = 512;
        let alturaFundo = 160;
        let posicaoYFundo = 240 - alturaFundo;

        for (let x = 0; x < 3000; x += larguraFundo) {
            this.imagem(this.fundo, x, posicaoYFundo, larguraFundo, alturaFundo);
        }

        this.preenchimento("#228B22");
        this.contorno(2, "#006400");
        for (let plat of this.plataformas) {
            this.retangulo(plat.x, plat.y, plat.largura, plat.altura, Estilo.PREENCHIDO);
            this.retangulo(plat.x, plat.y, plat.largura, plat.altura, Estilo.LINHAS);
        }

        this.desenharSprite(this.jogador);
        this.desempilhar();
        this.preenchimento("rgba(0, 0, 0, 0.5)");
        this.retangulo(10, 10, 320, 25, Estilo.PREENCHIDO);
        this.gc.font = "bold 12px 'Courier New', monospace";
        this.preenchimento("#FFD700");
        this.gc.fillText("A/D = Mover | W/Espaço = Pular", 20, 26);
    }
}

window.addEventListener("load", () => {
    new MeuJogo("Super Mario", "gameCanvas", 512, 288, 60);
});