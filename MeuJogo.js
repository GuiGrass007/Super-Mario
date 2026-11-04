class MeuJogo extends JS_CG_2D_API {
    acaoAoIniciar() {
        this.fundo = new Image();
        this.pontos = 0;
        this.vida = 3;
        this.inimigos = [
            { x: 100, y: 212, vx: 2, vy: 0 },
            { x: 400, y: 212, vx: 2, vy: -2 },
            { x: 300, y: 212, vx: 2, vy: 2 },
            { x: 600, y: 212, vx: 2, vy: -1 }
        ];
        this.imgInimigo = new Image(); this.imgInimigo.src = "imagens/player_1.png";
        this.haColisao = false;
        this.fundo.src = "imagens/fundo1.png"; 
        this.teclas = {};

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


        this.velocidadeAndando = 2;
        this.cameraX = 0;
    }

    teclaPressionada(e) {
        this.teclas[e.key] = true;
        if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D"].includes(e.key)) {
            this.alvoMouseX = null;
        }
        if ([" "].includes(e.key)) {
            this.fjogador.pular();
        }
    }

    teclaLiberada(e) {
        this.teclas[e.key] = false;
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


    for (let e of this.inimigos) {
      e = new Retangulo2D(e.x, e.y, 16,32);
      e.x += e.vx;
      const veioDeCima = this.fjogador.prevY + this.fjogador.h <= e.py;

      if (e.x < 0 || e.x >  this.larguraTela() - 40) e.vx *= -1;

      if (this.fjogador.getColisor().intersects(e.getBordas()) && veioDeCima) {
        this.fjogador.pular();
      }
    }

    
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
        for (let e of this.inimigos) {
            this.imagem(this.imgInimigo, e.x, e.y);
        }

        this.desenharSprite(this.jogador);
        this.desempilhar();
        this.preenchimento("rgba(0, 0, 0, 0.5)");
        this.retangulo(10, 10, 320, 25, Estilo.PREENCHIDO);
        this.gc.font = "bold 12px 'Courier New', monospace";
        this.preenchimento("#FFD700");
        this.gc.fillText("A/D = Mover | W/Espaço = Pular", 20, 26);

        if(this.haColisao){
            this.preenchimento("red");
            this.texto("Colidiu", 140, 170, 26, "bold");
        }

        
    }
}

window.addEventListener("load", () => {
    new MeuJogo("Super Mario", "gameCanvas", 512, 288, 60);
});