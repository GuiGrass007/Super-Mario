class MeuJogo extends JS_CG_2D_API {
    acaoAoIniciar() {
        this.fundo = new Image();
        this.pontos = 0;
        this.vida = 3;
        this.statusVivo = true;
        this.imgcerveja = this.carregarFrames("Polar", 1,"imagens/Polar");

        this.fundo.src = "imagens/fundo1.png"; 
        this.teclas = {};

        this.plataformas = [
            new Retangulo2D(0, 240, 3000, 48),   
            new Retangulo2D(120, 180, 80, 16),    
            new Retangulo2D(250, 130, 80, 16),  
            new Retangulo2D(-20, 0, 20, 288),    
            new Retangulo2D(3000, 0, 20, 288)     
        ];
        EfeitosSonoros.carregarSom("coleta", "sons/SomCeva.mp3");
        EfeitosSonoros.carregarSom("pulo", "sons/somPulo.mp3");
        EfeitosSonoros.carregarSom("inimigoMorre", "sons/inimigoMorrendo.mp3");


        this.boss = new Personagem(500,500,16,32,this.plataformas);
        this.boss.setGravidade(0.7);
        this.boss.setForcaPulo(-10);
        this.velBoss = 4;



        this.projetil = new Retangulo2D(500,500,16,16);
        this.projetilVel = 3;

        this.iniciarTimer("tiro", Math.random(), true, () => {});

        const posCerveja = [
            { x:200 ,y:148},
            { x:270 ,y:98},
            { x:520 ,y:208},
            { x:780 ,y:208}
        ];
        this.cerveja = [];
        
        for(const pos of posCerveja){
            let ceva = new Sprite(pos.x,pos.y);
            ceva.setTamanho(16,32);
            ceva.setAnimacao(this.imgcerveja);
            this.cerveja.push(ceva);
        }



        this.inimigos = new ListaPersonagens();

        const posicoesInimigos = [200, 300, 400, 500, 700, 900];
        for (const posx of posicoesInimigos) {
            const inimigo = new Personagem(posx, 208, 16, 32, this.plataformas);
            this.inimigos.inserirFim(inimigo);
        }
        this.eVelX = 2;
        this.inimigoeVelX = 2;


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
            EfeitosSonoros.tocarSom("pulo", false, true); 
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

    let BossX = this.boss.getX() + this.velBoss;
    if(BossX < 0 || BossX > this.larguraTela() - 40){
        this.velBoss *= -2;
    }
    let tempo = this.getTimer("tiro");

    if(tempo < 0){//verificar para qual lado ele está olhando
        let ex = this.projetil.getX() + this.projetilVel;
    }
    this.boss.setX(BossX);
    this.boss.atualizar();
    

    this.inimigos.paraCada((inimigo) => {
      let ex = inimigo.getX() + this.inimigoeVelX;
      if (ex < 0 || ex > this.larguraTela() - 40) {
        this.inimigoeVelX *= -1;
      }
      inimigo.setX(ex);
      inimigo.atualizar();

      if(this.colisao(this.fjogador,inimigo)){
        const caiuDeCima = this.fjogador.velY > 0 && this.fjogador.prevY + this.fjogador.h <= inimigo.y + inimigo.h / 2;

        if(caiuDeCima){
            this.fjogador.velY = this.fjogador.forcaPulo * 0.7;
            EfeitosSonoros.tocarSom("inimigoMorre", false, true); 
            this.inimigos.remover(inimigo);
        }else{
            this.vida--;
        }
      }

    });


    for (let i = this.cerveja.length - 1; i >= 0; i--) {
      let cevinha = this.cerveja[i];
      cevinha.atualizar();
      if (this.jogador.colisao(cevinha)) {
        EfeitosSonoros.tocarSom("coleta", false, true);
        this.pontos += 10;
        this.cerveja.splice(i, 1);
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
        

        this.desenharSprite(this.jogador);

        this.cerveja.forEach((ceva) => this.desenharSprite(ceva));


       this.preenchimento("darkred");
       this.inimigos.paraCada((inimigo) => {
       this.retangulo(
            inimigo.getX(),
            inimigo.getY(),
            inimigo.w,
            inimigo.h,
            Estilo.PREENCHIDO
        );
        });
        this.desempilhar();
        this.preenchimento("rgba(0, 0, 0, 0.5)");
        this.retangulo(10, 10, 340, 25, Estilo.PREENCHIDO);
        this.gc.font = "bold 12px 'Courier New', monospace";
        this.preenchimento("#FFD700");
        this.gc.fillText(`A/D = Mover | W/Espaço = Pular | Pontos = ${this.pontos}`, 20, 26);

        

        if (this.cerveja) {
            this.preenchimento("#e94560");
            this.circulo(this.cerveja.x, this.cerveja.y, this.cerveja.largura, this.cerveja.altura, Estilo.PREENCHIDO);
        }

        
    }
}

window.addEventListener("load", () => {
    new MeuJogo("Super Mario", "gameCanvas", 512, 288, 60);
});