/**
 * ******************************************************************************************************************
 * ********************************************  JS CG 2D API  ******************************************************
 * **************************************** -- GUSTAVO RISSETTI -- **************************************************
 * ******************************************************************************************************************
 *
 * API para ensino de Computação Gráfica 2D e Desenvolvimento de Jogos. Centrada no uso da API Canvas 2D do HTML5,
 * permite o desenho de primitivas gráficas, textos, manipulação de sprites, além de gerenciamento de áudio,
 * transformações geométricas, temporizadores e detecção de colisões.
 *
 * Para uso da API, deve-se estender a classe JS_CG_2D_API e sobrescrever os seus métodos de evento e ciclo de vida
 * (como acaoAoIniciar, atualizar e desenhar) para construir a lógica do jogo ou aplicação gráfica.
 *
 * Nota sobre Construtores:
 * Não é necessário declarar um método constructor() na subclasse (classe do Jogo). Toda a inicialização de variáveis
 * e objetos deve ser feita no método acaoAoIniciar(), que é chamado automaticamente. A declaração de um construtor
 * só é necessária caso o jogo precise receber parâmetros customizados extras, sendo obrigatório utilizar super(...).
 *
 * @example
 * <!-- 1. Estrutura básica HTML (index.html) -->
 * <!DOCTYPE html>
 * <meta charset="UTF-8">
 * <script src="js_cg_2d_api.js"></script>
 * <script src="jogo.js"></script>
 *
 * @example
 * // 2. Implementação do Jogo em JS (jogo.js - uso padrão):
 * class MeuJogo extends JS_CG_2D_API {
 *   acaoAoIniciar() {
 *     // Configuração inicial do jogo, variáveis e objetos
 *     this.pontos = 0;
 *   }
 *
 *   atualizar() {
 *     // Lógica de movimentação e física a cada frame
 *   }
 *
 *   desenhar() {
 *     // Limpeza de tela e renderização gráfica
 *   }
 * }
 *
 * window.addEventListener("load", () => {
 *   new MeuJogo("Título do Jogo", "gameCanvas", 800, 600);
 * });
 *
 * @example
 * // 3. Uso avançado (com construtor para parâmetros customizados extras):
 * class JogoComModo extends JS_CG_2D_API {
 *   constructor(dificuldade, ...parametrosBase) {
 *     super(...parametrosBase); // Repassa nome, canvasId, largura e altura
 *     this.dificuldade = dificuldade;
 *   }
 * }
 *
 * window.addEventListener("load", () => {
 *   new JogoComModo("Difícil", "Título do Jogo", "gameCanvas", 800, 600);
 * });
 */

/**
 * Modos de renderização para primitivas gráficas.
 * @enum {number}
 * @readonly
 */
const Estilo = Object.freeze({
  /** Renderiza apenas os vértices/pontos da primitiva. */
  PONTOS: 1,
  /** Renderiza as linhas de contorno (wireframe) da primitiva. */
  LINHAS: 2,
  /** Renderiza a primitiva com preenchimento sólido. */
  PREENCHIDO: 3,
});

/**
 * Representa um botão virtual interativo na tela para suporte a interações via Touch ou Mouse.
 */
class BotaoTouch {
  /**
   * Cria uma instância de um botão touch virtual.
   * @param {string} id - Identificador único do botão.
   * @param {number} x - Posição X no canvas virtual.
   * @param {number} y - Posição Y no canvas virtual.
   * @param {number} largura - Largura do botão em pixels.
   * @param {number} altura - Altura do botão em pixels.
   * @param {string} [rotulo=""] - Texto ou símbolo exibido no centro do botão.
   * @param {string|null} [teclaAssociada=null] - Nome da tecla vinculada a ser simulada (ex: "ArrowLeft", " ", "a").
   */
  constructor(id, x, y, largura, altura, rotulo = "", teclaAssociada = null) {
    /** @type {string} Identificador único do botão. */
    this.id = id;
    /** @type {number} Posição X inicial. */
    this.x = x;
    /** @type {number} Posição Y inicial. */
    this.y = y;
    /** @type {number} Largura do botão. */
    this.largura = largura;
    /** @type {number} Altura do botão. */
    this.altura = altura;
    /** @type {string} Rótulo exibido. */
    this.rotulo = rotulo;
    /** @type {string|null} Tecla do teclado simulada ao pressionar. */
    this.teclaAssociada = teclaAssociada;
    /** @type {boolean} Indica se o botão está atualmente pressionado. */
    this.pressionado = false;

    // Estilização padrão
    /** @type {string} Cor de fundo em estado normal. */
    this.corPadrao = "rgba(30, 30, 30, 0.45)";
    /** @type {string} Cor de fundo em estado pressionado. */
    this.corPressionado = "rgba(80, 80, 80, 0.75)";
    /** @type {string} Cor do contorno do botão. */
    this.corBorda = "rgba(255, 255, 255, 0.4)";
    /** @type {string} Cor do texto do rótulo. */
    this.corTexto = "#FFFFFF";
    /** @type {number} Tamanho da fonte do rótulo em pixels. */
    this.tamanhoFonte = 20;

    /** @type {number} Duração do feedback tátil de vibração em milissegundos (0 desativa). */
    this.tempoVibracao = 30;
  }

  /**
   * Define a duração da vibração ao pressionar o botão.
   * @param {number} ms - Tempo de vibração em milissegundos.
   * @returns {BotaoTouch} Retorna a própria instância para encadeamento.
   */
  setVibracao(ms) {
    this.tempoVibracao = ms;
    return this;
  }

  /**
   * Dispara o feedback tátil no dispositivo via Vibration API, caso haja suporte.
   */
  vibrar() {
    if (
      this.tempoVibracao > 0 &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator
    ) {
      try {
        navigator.vibrate(this.tempoVibracao);
      } catch (e) {
        // Ignora caso o navegador bloqueie permissão de vibração sem interação prévia
      }
    }
  }

  /**
   * Define todas as cores do botão em uma única chamada.
   * @param {string} [corPadrao] - Cor de fundo padrão.
   * @param {string} [corPressionado] - Cor de fundo quando pressionado.
   * @param {string|null} [corBorda=null] - Cor da borda.
   * @param {string|null} [corTexto=null] - Cor do texto.
   * @returns {BotaoTouch} Retorna a própria instância para encadeamento.
   */
  setCores(corPadrao, corPressionado, corBorda = null, corTexto = null) {
    if (corPadrao) this.corPadrao = corPadrao;
    if (corPressionado) this.corPressionado = corPressionado;
    if (corBorda) this.corBorda = corBorda;
    if (corTexto) this.corTexto = corTexto;
    return this;
  }

  /**
   * Define a cor de fundo padrão.
   * @param {string} cor - Cor CSS.
   * @returns {BotaoTouch} Retorna a própria instância.
   */
  setCorPadrao(cor) {
    this.corPadrao = cor;
    return this;
  }

  /**
   * Define a cor de fundo quando ativado.
   * @param {string} cor - Cor CSS.
   * @returns {BotaoTouch} Retorna a própria instância.
   */
  setCorPressionado(cor) {
    this.corPressionado = cor;
    return this;
  }

  /**
   * Define a cor do contorno.
   * @param {string} cor - Cor CSS.
   * @returns {BotaoTouch} Retorna a própria instância.
   */
  setCorBorda(cor) {
    this.corBorda = cor;
    return this;
  }

  /**
   * Define a cor do rótulo.
   * @param {string} cor - Cor CSS.
   * @returns {BotaoTouch} Retorna a própria instância.
   */
  setCorTexto(cor) {
    this.corTexto = cor;
    return this;
  }

  /**
   * Define a dimensão da fonte do texto.
   * @param {number} tamanho - Tamanho em px.
   * @returns {BotaoTouch} Retorna a própria instância.
   */
  setTamanhoFonte(tamanho) {
    this.tamanhoFonte = tamanho;
    return this;
  }

  /**
   * Testa se um ponto (px, py) está contido dentro do retângulo do botão.
   * @param {number} px - Coordenada X.
   * @param {number} py - Coordenada Y.
   * @returns {boolean} Verdadeiro se estiver dentro.
   */
  contem(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.largura &&
      py >= this.y &&
      py <= this.y + this.altura
    );
  }

  /**
   * Verifica se um evento de clique ou toque ocorreu dentro do botão.
   * @param {Object} e - Evento com coordenadas normalizadas (e.x e e.y).
   * @returns {boolean} Verdadeiro se o evento atingiu o botão.
   */
  foiClicado(e) {
    return (
      e &&
      typeof e.x === "number" &&
      typeof e.y === "number" &&
      this.contem(e.x, e.y)
    );
  }
}

/**
 * Representa uma caixa delimitadora alinhada aos eixos (AABB - Axis-Aligned Bounding Box) para detecção de colisão 2D.
 */
class Retangulo2D {
  /**
   * Cria uma instância de Retangulo2D.
   * @param {number} x - Posição inicial no eixo X.
   * @param {number} y - Posição inicial no eixo Y.
   * @param {number} largura - Largura do retângulo.
   * @param {number} altura - Altura do retângulo.
   */
  constructor(x, y, largura, altura) {
    /** @type {number} Posição X da aresta esquerda. */
    this.x = x;
    /** @type {number} Posição Y da aresta superior. */
    this.y = y;
    /** @type {number} Dimensão horizontal. */
    this.largura = largura;
    /** @type {number} Dimensão vertical. */
    this.altura = altura;
  }

  /** @returns {number} Posição da aresta esquerda. */
  get minX() {
    return this.x;
  }
  /** @returns {number} Posição da aresta superior. */
  get minY() {
    return this.y;
  }
  /** @returns {number} Posição da aresta direita. */
  get maxX() {
    return this.x + this.largura;
  }
  /** @returns {number} Posição da aresta inferior. */
  get maxY() {
    return this.y + this.altura;
  }

  /** @returns {number} Posição da aresta esquerda. */
  getMinX() {
    return this.x;
  }
  /** @returns {number} Posição da aresta superior. */
  getMinY() {
    return this.y;
  }
  /** @returns {number} Posição da aresta direita. */
  getMaxX() {
    return this.x + this.largura;
  }
  /** @returns {number} Posição da aresta inferior. */
  getMaxY() {
    return this.y + this.altura;
  }
  /** @returns {number} Largura do retângulo. */
  getWidth() {
    return this.largura;
  }
  /** @returns {number} Altura do retângulo. */
  getHeight() {
    return this.altura;
  }

  /**
   * Verifica a interseção (AABB) entre este retângulo e outro.
   * @param {Retangulo2D} outro - O retângulo a ser testado.
   * @returns {boolean} Verdadeiro se houver sobreposição.
   */
  intersects(outro) {
    return (
      this.x < outro.x + outro.largura &&
      this.x + this.largura > outro.x &&
      this.y < outro.y + outro.altura &&
      this.y + this.altura > outro.y
    );
  }
}

/**
 * Gerenciador estático de efeitos sonoros e áudio.
 */
class EfeitosSonoros {
  /**
   * Coleção de áudios registrados.
   * @type {Map<string, HTMLAudioElement>}
   */
  static sons = new Map();

  /**
   * Carrega um arquivo de áudio e associa a uma chave.
   * @param {string} id - Identificador único do áudio.
   * @param {string} src - Caminho do arquivo de áudio.
   */
  static carregarSom(id, src) {
    this.sons.set(id, new Audio(src));
  }

  /**
   * Ajusta o volume de um som específico.
   * @param {string} id - Identificador do som.
   * @param {number} volume - Volume entre 0.0 (mudo) e 1.0 (máximo).
   */
  static volumeSom(id, volume) {
    const som = this.sons.get(id);
    if (som) som.volume = volume;
    else console.warn(`Som [ ${id} ] não carregado.`);
  }

  /**
   * Toca um som registrado.
   * @param {string} id - Identificador do som.
   * @param {boolean} [exclusivo=false] - Se true, interrompe todos os outros sons antes de tocar.
   * @param {boolean} [sobreposto=false] - Se true, clona o áudio permitindo execuções simultâneas.
   */
  static tocarSom(id, exclusivo = false, sobreposto = false) {
    const som = this.sons.get(id);
    if (!som) return console.warn(`Som [ ${id} ] não carregado.`);

    if (exclusivo) {
      this.sons.forEach((s) => {
        s.pause();
        s.currentTime = 0;
      });
    }

    if (sobreposto) {
      const clone = som.cloneNode();
      clone.volume = som.volume;
      const limpar = () => {
        clone.onended = null;
      };
      clone.onended = limpar;
      clone.play().catch(limpar);
    } else {
      som.currentTime = 0;
      som.play().catch(() => {});
    }
  }

  /**
   * Interrompe e reinicia a reprodução de um som.
   * @param {string} id - Identificador do som.
   */
  static pararSom(id) {
    const som = this.sons.get(id);
    if (som && !som.paused) {
      som.pause();
      som.currentTime = 0;
    }
  }
}

/**
 * Entidade com simulação física simples (gravidade, pulo e colisão com plataformas).
 */
class Personagem {
  /**
   * @param {number} x - Posição X inicial.
   * @param {number} y - Posição Y inicial.
   * @param {number} largura - Largura do colisor do personagem.
   * @param {number} altura - Altura do colisor do personagem.
   * @param {Array<Object>} [plataformas=[]] - Lista de objetos de plataforma para tratar colisões.
   */
  constructor(x, y, largura, altura, plataformas = []) {
    /** @type {number} Posição atual X. */
    this.x = x;
    /** @type {number} Posição atual Y. */
    this.y = y;
    /** @type {number} Posição Y no frame anterior. */
    this.prevY = y;
    /** @type {number} Posição X no frame anterior. */
    this.prevX = x;
    /** @type {number} Largura do personagem. */
    this.w = largura;
    /** @type {number} Altura do personagem. */
    this.h = altura;
    /** @type {number} Velocidade vertical atual. */
    this.velY = 0.0;
    /** @type {boolean} Indica se a entidade está apoiada no chão. */
    this.noChao = false;

    /** @type {number} Aceleração da gravidade aplicada por frame. */
    this.gravidade = 0.6;
    /** @type {number} Impulso vertical do pulo (valor negativo). */
    this.forcaPulo = -12.0;
    /** @type {number} Limite máximo da velocidade de queda. */
    this.velTerminal = 18.0;
    /** @type {Array<Object>} Coleção de obstáculos/plataformas. */
    this.plataformas = plataformas;

    /** @private */
    this._caixaColisao = new Retangulo2D(x, y, largura, altura);
  }

  /**
   * Método auxiliar que extrai os limites de qualquer tipo de objeto/plataforma passado para a API.
   *
   * RECURSOS UTILIZADOS:
   * 1. Encadeamento Opcional (?.): Executa o método apenas se ele existir no objeto,
   *    evitando erros de execução como "TypeError: plat.getWidth is not a function".
   *
   * 2. Coalescência Nula (??): Retorna o valor da direita APENAS se o da esquerda for
   *    'null' ou 'undefined'.
   */
  _obterLimitesPlataforma(plat) {
    // Busca X via propriedade (x, px), método opcional (getMinX) ou fallback (0)
    const minX = plat.x ?? plat.px ?? plat.getMinX?.() ?? 0;
    // Busca Y via propriedade (y, py), método opcional (getMinY) ou fallback (0)
    const minY = plat.y ?? plat.py ?? plat.getMinY?.() ?? 0;
    // Busca largura testando propriedades (largura, w, l), método (getWidth) ou fallback (0)
    const w = plat.largura ?? plat.w ?? plat.l ?? plat.getWidth?.() ?? 0;
    // Busca altura testando propriedades (altura, h, a), método (getHeight) ou fallback (0)
    const h = plat.altura ?? plat.h ?? plat.a ?? plat.getHeight?.() ?? 0;
    return { minX: minX, maxX: minX + w, minY: minY, maxY: minY + h };
  }

  /**
   * Atualiza a física (posição, velocidade e resolução de colisões com plataformas).
   */
  atualizar() {
    if (!this.plataformas) return;
    // RESOLUÇÃO DE COLISÃO HORIZONTAL
    for (const plat of this.plataformas) {
      const p = this._obterLimitesPlataforma(plat);
      // Teste de intersecção AABB (Caixa Delimitadora)
      const colidiuX = this.x + this.w > p.minX && this.x < p.maxX;
      const colidiuY = this.y + this.h > p.minY && this.y < p.maxY;
      if (colidiuX && colidiuY) {
        // Vindo da esquerda em direção ao bloco
        if (this.prevX + this.w <= p.minX) {
          this.x = p.minX - this.w;
        }
        // Vindo da direita em direção ao bloco
        else if (this.prevX >= p.maxX) {
          this.x = p.maxX;
        }
      }
    }
    // Guarda a posição X validada na checagem horizontal
    this.prevX = this.x;
    // RESOLUÇÃO DE COLISÃO VERTICAL
    this.prevY = this.y;
    this.velY = Math.min(this.velY + this.gravidade, this.velTerminal);
    this.y += this.velY;
    this.noChao = false;

    for (const plat of this.plataformas) {
      const p = this._obterLimitesPlataforma(plat);
      // Teste de intersecção AABB (Caixa Delimitadora)
      const colidiuX = this.x + this.w > p.minX && this.x < p.maxX;
      const colidiuY = this.y + this.h > p.minY && this.y < p.maxY;
      if (colidiuX && colidiuY) {
        // Pouso na plataforma
        if (this.velY >= 0 && this.prevY + this.h <= p.minY) {
          this.y = p.minY - this.h;
          this.velY = 0;
          this.noChao = true;
        }
        // Batida no teto
        else if (this.velY < 0 && this.prevY >= p.maxY) {
          this.y = p.maxY;
          this.velY = 0;
        }
      }
    }
  }

  /**
   * Executa a ação de pulo caso o personagem esteja encostado no chão.
   */
  pular() {
    if (this.noChao) {
      this.velY = this.forcaPulo;
      this.noChao = false;
    }
  }

  /** @returns {number} Posição X. */
  getX() {
    return this.x;
  }
  /** @returns {number} Posição Y. */
  getY() {
    return this.y;
  }
  /** @param {number} x - Nova posição X. */
  setX(x) {
    this.x = x;
  }
  /** @param {number} y - Nova posição Y. */
  setY(y) {
    this.y = y;
  }
  /** @returns {boolean} Retorna true se estiver no chão. */
  isNoChao() {
    return this.noChao;
  }
  /** @param {number} g - Nova aceleração da gravidade. */
  setGravidade(g) {
    this.gravidade = g;
  }
  /** @param {number} f - Nova força de pulo. */
  setForcaPulo(f) {
    this.forcaPulo = f;
  }
  /** @param {number} v - Nova velocidade terminal. */
  setVelTerminal(v) {
    this.velTerminal = v;
  }
  /** @param {Array<Object>} p - Nova lista de plataformas. */
  setPlataformas(p) {
    this.plataformas = p || [];
  }
  /** @param {Object|Array<Object>} p - Plataforma(s) a adicionar. */
  addPlataformas(p) {
    if (Array.isArray(p)) this.plataformas.push(...p);
    else this.plataformas.push(p);
  }

  /**
   * Obtém a caixa delimitadora (AABB) atualizada.
   * @returns {Retangulo2D} Colisor do personagem.
   */
  getColisor() {
    this._caixaColisao.x = this.x;
    this._caixaColisao.y = this.y;
    this._caixaColisao.largura = this.w;
    this._caixaColisao.altura = this.h;
    return this._caixaColisao;
  }
}

/**
 * Classe Principal (Engine) para Computação Gráfica 2D via HTML5 Canvas.
 * Gerencia o Game Loop, eventos, temporizadores e primitivas de renderização.
 */
class JS_CG_2D_API {
  /**
   * @param {string} nome - Título do jogo (Obrigatório)
   * @param {string} canvasId - ID do Canvas (Obrigatório)
   * @param {number} w - Largura em pixels (Obrigatório)
   * @param {number} h - Altura em pixels (Obrigatório)
   * @param {number} [fps=60] - Taxa de quadros (Opcional, padrão: 60)
   */
  constructor(nome, canvasId, w, h, fps = 60) {
    // Validação de todos os parâmetros obrigatórios
    if (!nome || !canvasId || w === undefined || h === undefined) {
      throw new Error(
        "Erro de Instanciação: Os parâmetros 'nome', 'canvasId', 'w' (largura) e 'h' (altura) são OBRIGATÓRIOS!",
      );
    }
    if (typeof w !== "number" || typeof h !== "number" || w <= 0 || h <= 0) {
      throw new Error(
        "Erro de Instanciação: 'w' (largura) e 'h' (altura) precisam ser números positivos válidos.",
      );
    }
    this.nome = nome;
    this.largura = w;
    this.altura = h;
    this.larguraPadrao = w;
    this.alturaPadrao = h;
    this._fps = fps;
    // Se fps for <= 0, desativa o limite de taxa e roda no máximo do navegador
    this._intervaloFps = fps > 0 ? 1000 / fps : 0;
    this._ultimoFrame = 0;
    this._loopId = null;

    // Usado nos métodos empilhar e desempilhar.
    this._pilhaEstado = [];
    this._larguraContorno = 1;
    this._corContorno = "black";
    this._corPreenchimento = "black";

    /** @type {Map<string, BotaoTouch>} Coleção de botões virtuais cadastrados. */
    this.botoesTouch = new Map();

    // Configuração metas e CSS global
    this._configurarTagsIniciais();
    this._injetarEstilosPadrao();

    // Busca o canvas ou cria um novo caso não tenha colocado no HTML (padrão).
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.id = canvasId;
      document.body.appendChild(this.canvas);
    }

    this.canvas.width = this.largura;
    this.canvas.height = this.altura;

    // Adaptação Responsiva mantendo o aspect-ratio
    this.canvas.style.maxWidth = "100vw";
    this.canvas.style.maxHeight = "100vh";
    this.canvas.style.objectFit = "contain";
    this.canvas.style.touchAction = "none"; // Impede gestos padrão do navegador (scroll/zoom)

    // Desabilita clique com botão direito do mouse dentro do canvas
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    this.canvas.tabIndex = 1;
    this.canvas.focus();

    /** @type {CanvasRenderingContext2D} Contexto gráfico 2D. */
    this.gc = this.canvas.getContext("2d");
    /** @type {Map<string, Object>} Tabela de temporizadores ativos. */
    this.timers = new Map();

    document.title = this.nome;

    this.acaoAoIniciar();
    this._configurarEventos();
    this.iniciar();
  }

  /**
   * Garante que tags essenciais existam no <head>
   * @private
   */
  _configurarTagsIniciais() {
    // Verifica a codificação atual e avisa se não estiver em UTF-8
    const charsetAtual = (document.characterSet || "").toUpperCase();
    if (charsetAtual && charsetAtual !== "UTF-8") {
      console.warn(
        `[JS_CG_2D_API] Alerta: O navegador carregou este projeto em '${charsetAtual}'. ` +
          "Para corrigir acentos e caracteres especiais, adicione '<meta charset=\"UTF-8\">'" +
          " na primeira linha abaixo de <!DOCTYPE html> de seu arquivo .html",
      );
    }
    // Tag de viewport
    if (!document.querySelector("meta[name='viewport']")) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
      document.head.appendChild(meta);
    }
  }

  /**
   * Injeta estilos CSS pré-configurados no topo do head sem sobresscrever CSS externo.
   * @private
   */
  _injetarEstilosPadrao() {
    if (document.getElementById("js-cg-2d-styles")) return;

    const style = document.createElement("style");
    style.id = "js-cg-2d-styles";
    style.textContent = `
      * { 
        box-sizing: border-box; 
        margin: 0; 
        padding: 0; 
      }
      html, body {
        width: 100vw;
        height: 100vh;
        height: 100dvh;
        background: radial-gradient(circle at center, #1a1c24 0%, #0d0e12 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        font-family: system-ui, -apple-system, sans-serif;
        user-select: none;
        -webkit-user-select: none;
      }
      canvas {
        display: block;
        background-color: #000000;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 6px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 15px rgba(255, 255, 255, 0.03);
        outline: none;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
      }
    `;
    document.head.prepend(style);
  }

  /**
   * Converte as coordenadas do evento de ponteiro/touch/mouse na tela para a escala de resolução interna do Canvas.
   * @private
   * @param {MouseEvent|TouchEvent} e - Evento de entrada nativo do navegador.
   * @returns {{x: number, y: number}} Coordenadas ajustadas à escala real do Canvas.
   */
  _obterCoordenadasCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.largura / rect.width;
    const scaleY = this.altura / rect.height;

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  /**
   * Encapsula eventos nativos injetando coordenadas normalizadas (x, y, offsetX, offsetY)
   * compatíveis com a resolução interna do Canvas.
   * @private
   * @param {Event} e - Evento nativo.
   * @returns {Object} Evento com coordenadas ajustadas.
   */
  _normalizarEvento(e) {
    const coords = this._obterCoordenadasCanvas(e);
    const evtNormalizado = Object.create(e);

    Object.defineProperties(evtNormalizado, {
      x: {
        value: coords.x,
        writable: true,
        configurable: true,
        enumerable: true,
      },
      y: {
        value: coords.y,
        writable: true,
        configurable: true,
        enumerable: true,
      },
      offsetX: {
        value: coords.x,
        writable: true,
        configurable: true,
        enumerable: true,
      },
      offsetY: {
        value: coords.y,
        writable: true,
        configurable: true,
        enumerable: true,
      },
      preventDefault: {
        value: () => e.preventDefault?.(),
        writable: true,
        configurable: true,
        enumerable: true,
      },
      stopPropagation: {
        value: () => e.stopPropagation?.(),
        writable: true,
        configurable: true,
        enumerable: true,
      },
    });

    return evtNormalizado;
  }

  /**
   * Avalia as posições dos toques ativos no dispositivo em relação a todos os botões virtuais cadastrados.
   * @private
   * @param {TouchEvent} e - Evento Touch original do navegador.
   */
  _processarTouches(e) {
    if (this.botoesTouch.size === 0) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.larguraPadrao / rect.width;
    const scaleY = this.alturaPadrao / rect.height;

    // Mapeia todas as pontas dos dedos encostadas na tela
    const toquesAtivos = [];
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      toquesAtivos.push({
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY,
      });
    }

    for (const btn of this.botoesTouch.values()) {
      const estaPressionado = toquesAtivos.some((t) => btn.contem(t.x, t.y));
      this._atualizarEstadoBotao(btn, estaPressionado);
    }
  }

  /**
   * Processa o clique ou arraste do mouse nos botões virtuais cadastrados.
   * @private
   * @param {MouseEvent} e - Evento de Mouse original do navegador.
   * @param {boolean} estaPressionando - Indica se algum botão do mouse está pressionado.
   */
  _processarMouseBotoes(e, estaPressionando) {
    if (this.botoesTouch.size === 0) return;

    const coords = this._obterCoordenadasCanvas(e);
    for (const btn of this.botoesTouch.values()) {
      const estaSobreOTexto = btn.contem(coords.x, coords.y);
      const estaPressionado = estaPressionando && estaSobreOTexto;
      this._atualizarEstadoBotao(btn, estaPressionado);
    }
  }

  /**
   * Transiciona o estado do botão, aciona o feedback tátil e dispara eventos simulados de teclado.
   * @private
   * @param {BotaoTouch} btn - Instância do botão processado.
   * @param {boolean} novoEstado - Novo estado de pressão (true/false).
   */
  _atualizarEstadoBotao(btn, novoEstado) {
    if (novoEstado && !btn.pressionado) {
      btn.pressionado = true;
      btn.vibrar(); // Feedback tátil (vibração)
      if (btn.teclaAssociada) {
        // Simula evento de tecla pressionada
        this.teclaPressionada({
          key: btn.teclaAssociada,
          preventDefault: () => {},
        });
      }
    } else if (!novoEstado && btn.pressionado) {
      btn.pressionado = false;
      if (btn.teclaAssociada) {
        // Simula evento de tecla liberada
        this.teclaLiberada({
          key: btn.teclaAssociada,
          preventDefault: () => {},
        });
      }
    }
  }

  /**
   * Associa os manipuladores de eventos nativos do navegador (Mouse, Touch e Teclado) às rotas internas da API.
   * @private
   */
  _configurarEventos() {
    // Eventos de Mouse
    this.canvas.addEventListener("click", (e) => {
      const evt = this._normalizarEvento(e);
      this.cliqueDoMouse(evt);
    });
    this.canvas.addEventListener("mousemove", (e) => {
      const evt = this._normalizarEvento(e);
      this._processarMouseBotoes(e, e.buttons > 0);
      if (e.buttons > 0) this.movimentoDoMousePressionado(evt);
      else this.movimentoDoMouse(evt);
    });
    this.canvas.addEventListener("mousedown", (e) => {
      const evt = this._normalizarEvento(e);
      this._processarMouseBotoes(e, true);
      this.mousePressionado(evt);
    });
    this.canvas.addEventListener("mouseup", (e) => {
      const evt = this._normalizarEvento(e);
      this._processarMouseBotoes(e, false);
      this.mouseSolto(evt);
    });

    // Eventos de Touch (Telas Sensíveis ao Toque)
    const tratarTouch = (e, callback) => {
      this._processarTouches(e);
      if (callback) {
        const evt = this._normalizarEvento(e);
        callback.call(this, evt);
      }
    };

    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      tratarTouch(e, this.mousePressionado);
    });
    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      tratarTouch(e, this.movimentoDoMousePressionado);
    });
    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      tratarTouch(e, (evt) => {
        this.mouseSolto(evt);
        this.cliqueDoMouse(evt);
      });
    });
    this.canvas.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      tratarTouch(e, this.mouseSolto);
    });

    // Eventos de Teclado
    window.addEventListener("keydown", (e) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
      this.teclaPressionada(e);
    });

    window.addEventListener("keyup", (e) => this.teclaLiberada(e));
    window.addEventListener("beforeunload", () => this.acaoAoSair());

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        this.largura = window.innerWidth;
        this.altura = window.innerHeight;
      } else {
        this.largura = this.larguraPadrao;
        this.altura = this.alturaPadrao;
      }
      this.canvas.width = this.largura;
      this.canvas.height = this.altura;
    });
  }

  /** @returns {number} Altura atual da viewport da API. */
  alturaTela() {
    return this.altura;
  }
  /** @returns {number} Largura atual da viewport da API. */
  larguraTela() {
    return this.largura;
  }
  /** @returns {number} Taxa de FPS configurada. */
  fps() {
    return this._fps;
  }

  /**
   * Modifica o Favicon do documento HTML.
   * @param {string} caminhoOuNome - Caminho completo ou nome da imagem armazenada em 'imagens/'.
   */
  icone(caminhoOuNome) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = caminhoOuNome.includes("/")
      ? caminhoOuNome
      : `imagens/${caminhoOuNome}`;
  }

  /**
   * Desenha um ponto (quadrado centralizado) na tela.
   * @param {number} x - Coordenada X.
   * @param {number} y - Coordenada Y.
   * @param {number} [tam=this.gc.lineWidth] - Tamanho do ponto em pixels.
   */
  ponto(x, y, tam = this.gc.lineWidth) {
    this.gc.fillRect(x - tam / 2, y - tam / 2, tam, tam);
  }

  /**
   * Desenha uma elipse/círculo.
   * @param {number} x - Posição X do canto superior esquerdo.
   * @param {number} y - Posição Y do canto superior esquerdo.
   * @param {number} l - Largura (diâmetro horizontal).
   * @param {number} a - Altura (diâmetro vertical).
   * @param {number} estilo - Modo de renderização (`Estilo.PREENCHIDO` ou `Estilo.LINHAS`).
   */
  circulo(x, y, l, a, estilo) {
    this.gc.beginPath();
    this.gc.ellipse(x + l / 2, y + a / 2, l / 2, a / 2, 0, 0, 2 * Math.PI);
    if (estilo === Estilo.PREENCHIDO) this.gc.fill();
    else this.gc.stroke();
  }

  /**
   * Desenha um retângulo na tela a partir de coordenadas ou objeto Retangulo2D.
   * @param {number|Retangulo2D} x - Coordenada X ou instância de Retangulo2D.
   * @param {number} y - Coordenada Y ou o estilo de desenho (caso o 1º parâmetro seja objeto).
   * @param {number} [l] - Largura.
   * @param {number} [a] - Altura.
   * @param {number} [estilo] - Modo de renderização (Estilo.PONTOS, Estilo.LINHAS ou Estilo.PREENCHIDO).
   */
  retangulo(x, y, l, a, estilo) {
    if (typeof x === "object" && x !== null) {
      estilo = y;
      a = x.altura ?? x.h ?? x.a ?? 0;
      l = x.largura ?? x.w ?? x.l ?? 0;
      y = x.y ?? x.py ?? 0;
      x = x.x ?? x.px ?? 0;
    }

    if (estilo === Estilo.PREENCHIDO) {
      this.gc.fillRect(x, y, l, a);
    } else if (estilo === Estilo.LINHAS) {
      this.gc.strokeRect(x, y, l, a);
    } else {
      this.ponto(x, y);
      this.ponto(x + l, y);
      this.ponto(x, y + a);
      this.ponto(x + l, y + a);
    }
  }

  /**
   * Desenha um triângulo definindo seus três vértices.
   * @param {number} x0 - X do Vértice 0.
   * @param {number} y0 - Y do Vértice 0.
   * @param {number} x1 - X do Vértice 1.
   * @param {number} y1 - Y do Vértice 1.
   * @param {number} x2 - X do Vértice 2.
   * @param {number} y2 - Y do Vértice 2.
   * @param {number} estilo - Modo de renderização (`Estilo`).
   */
  triangulo(x0, y0, x1, y1, x2, y2, estilo) {
    if (estilo === Estilo.PONTOS) {
      this.ponto(x0, y0);
      this.ponto(x1, y1);
      this.ponto(x2, y2);
      return;
    }
    this.gc.beginPath();
    this.gc.moveTo(x0, y0);
    this.gc.lineTo(x1, y1);
    this.gc.lineTo(x2, y2);
    this.gc.closePath();
    if (estilo === Estilo.PREENCHIDO) this.gc.fill();
    else this.gc.stroke();
  }

  /**
   * Desenha um paralelogramo definindo seus quatro vértices.
   * @param {number} x0 - X do Vértice 0.
   * @param {number} y0 - Y do Vértice 0.
   * @param {number} x1 - X do Vértice 1.
   * @param {number} y1 - Y do Vértice 1.
   * @param {number} x2 - X do Vértice 2.
   * @param {number} y2 - Y do Vértice 2.
   * @param {number} x3 - X do Vértice 3.
   * @param {number} y3 - Y do Vértice 3.
   * @param {number} estilo - Modo de renderização (`Estilo`).
   */
  paralelogramo(x0, y0, x1, y1, x2, y2, x3, y3, estilo) {
    if (estilo === Estilo.PONTOS) {
      this.ponto(x0, y0);
      this.ponto(x1, y1);
      this.ponto(x2, y2);
      this.ponto(x3, y3);
      return;
    }
    this.gc.beginPath();
    this.gc.moveTo(x0, y0);
    this.gc.lineTo(x1, y1);
    this.gc.lineTo(x2, y2);
    this.gc.lineTo(x3, y3);
    this.gc.closePath();
    if (estilo === Estilo.PREENCHIDO) this.gc.fill();
    else this.gc.stroke();
  }

  /**
   * Desenha um polígono arbitrário a partir de dois vetores de coordenadas.
   * @param {Array<number>} vetX - Lista de coordenadas X dos vértices.
   * @param {Array<number>} vetY - Lista de coordenadas Y dos vértices.
   * @param {number} estilo - Modo de renderização (`Estilo`).
   */
  poligono(vetX, vetY, estilo) {
    if (!vetX || !vetY || vetX.length === 0 || vetY.length === 0) return;
    const qtd = Math.min(vetX.length, vetY.length);

    if (estilo === Estilo.PONTOS) {
      for (let i = 0; i < qtd; i++) this.ponto(vetX[i], vetY[i]);
      return;
    }
    this.gc.beginPath();
    this.gc.moveTo(vetX[0], vetY[0]);
    for (let i = 1; i < qtd; i++) {
      this.gc.lineTo(vetX[i], vetY[i]);
    }
    this.gc.closePath();
    if (estilo === Estilo.PREENCHIDO) this.gc.fill();
    else this.gc.stroke();
  }

  /**
   * Define a cor de preenchimento do contexto gráfico.
   * @param {string} cor - Cor CSS (ex: "red", "#FF0000", "rgba(0,0,0,0.5)").
   */
  preenchimento(cor) {
    this.gc.fillStyle = cor;
  }

  /**
   * Define a cor e/ou espessura do contorno.
   * @param {number|string} expessuraOuCor - Espessura em pixels OU a cor do contorno.
   * @param {string} [corOpcional] - Cor do contorno caso o primeiro parâmetro seja número.
   */
  contorno(expessuraOuCor, corOpcional) {
    if (typeof expessuraOuCor === "number") {
      this._larguraContorno = expessuraOuCor;
      if (corOpcional) this._corContorno = corOpcional;
    } else {
      this._corContorno = expessuraOuCor;
    }

    this.gc.lineWidth = this._larguraContorno;
    this.gc.strokeStyle = this._corContorno;
  }

  /**
   * Desenha uma linha reta de um ponto inicial a um ponto final.
   * @param {number} xi - X Inicial.
   * @param {number} yi - Y Inicial.
   * @param {number} xf - X Final.
   * @param {number} yf - Y Final.
   * @param {number} [estilo=Estilo.LINHAS] - Modo de renderização.
   */
  linha(xi, yi, xf, yf, estilo = Estilo.LINHAS) {
    if (estilo === Estilo.PONTOS) {
      this.ponto(xi, yi);
      this.ponto(xf, yf);
    } else {
      this.gc.beginPath();
      this.gc.moveTo(xi, yi);
      this.gc.lineTo(xf, yf);
      this.gc.stroke();
    }
  }

  /**
   * Renderiza um texto na tela.
   * @param {string} texto - Texto a ser escrito.
   * @param {number} x - Posição X inicial.
   * @param {number} y - Posição Y da linha de base do texto.
   * @param {number} tam - Tamanho da fonte em pixels.
   * @param {string} [tipo="normal"] - Estilo/Peso do texto (ex: "bold", "italic").
   */
  texto(texto, x, y, tam, tipo = "normal") {
    this.gc.font = `${tipo} ${tam}px "Times New Roman"`;
    this.gc.fillText(texto, x, y);
  }

  /**
   * Extrai o retângulo delimitador para unificar os testes de colisão.
   * @private
   */
  _extrairBordas(obj) {
    if (!obj) return { x: 0, y: 0, w: 0, h: 0 };
    const b = obj.getBordas
      ? obj.getBordas()
      : obj.getColisor
        ? obj.getColisor()
        : obj;
    return {
      x: b.x ?? b.px ?? 0,
      y: b.y ?? b.py ?? 0,
      w: b.largura ?? b.w ?? b.l ?? 0,
      h: b.altura ?? b.h ?? b.a ?? 0,
    };
  }

  /**
   * Testa colisão (AABB) entre dois objetos ou entre 8 coordenadas numéricas explicitadas.
   * @param {Object|number} x1 - Objeto A OU X do retângulo 1.
   * @param {Object|number} y1 - Objeto B OU Y do retângulo 1.
   * @param {number} [w1] - Largura do retângulo 1.
   * @param {number} [h1] - Altura do retângulo 1.
   * @param {number} [x2] - X do retângulo 2.
   * @param {number} [y2] - Y do retângulo 2.
   * @param {number} [w2] - Largura do retângulo 2.
   * @param {number} [h2] - Altura do retângulo 2.
   * @returns {boolean} Verdadeiro se houver colisão.
   */
  colisao(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (arguments.length === 8) {
      return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    }
    const a = this._extrairBordas(x1);
    const b = this._extrairBordas(y1);
    return (
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
    );
  }

  /**
   * Aplica uma rotação ao sistema de coordenadas atual.
   * @param {number} ang - Ângulo de rotação em graus.
   */
  rotacionar(ang) {
    this.gc.rotate((ang * Math.PI) / 180);
  }

  /**
   * Aplica uma translação ao sistema de coordenadas.
   * @param {number} x - Deslocamento X.
   * @param {number} y - Deslocamento Y.
   */
  transladar(x, y) {
    this.gc.translate(x, y);
  }

  /**
   * Aplica uma escala ao sistema de coordenadas.
   * @param {number} x - Fator de escala no eixo X.
   * @param {number} y - Fator de escala no eixo Y.
   */
  escalar(x, y) {
    this.gc.scale(x, y);
  }

  /**
   * Desenha um objeto de imagem (HTMLImageElement ou Canvas).
   * @param {HTMLImageElement} imgObj - Elemento de imagem carregado.
   * @param {number} x - Coordenada X de destino.
   * @param {number} y - Coordenada Y de destino.
   * @param {number} [l] - (Opcional) Largura de exibição no canvas.
   * @param {number} [a] - (Opcional) Altura de exibição no canvas.
   */
  imagem(imgObj, x, y, l, a) {
    if (l !== undefined && a !== undefined) {
      this.gc.drawImage(imgObj, x, y, l, a);
    } else {
      this.gc.drawImage(imgObj, x, y);
    }
  }

  /** Salva o estado atual da matriz de transformação e do contexto gráfico. */
  empilhar() {
    this.gc.save();
    this._pilhaEstado.push({
      larguraContorno: this._larguraContorno,
      corContorno: this._corContorno,
      corPreenchimento: this._corPreenchimento,
    });
  }

  /** Restaura o último estado salvo da matriz de transformação e contexto. */
  desempilhar() {
    this.gc.restore();
    if (this._pilhaEstado.length > 0) {
      const estado = this._pilhaEstado.pop();
      this._larguraContorno = estado.larguraContorno;
      this._corContorno = estado.corContorno;
      this._corPreenchimento = estado.corPreenchimento;
      this.gc.lineWidth = this._larguraContorno;
      this.gc.strokeStyle = this._corContorno;
      this.gc.fillStyle = this._corPreenchimento;
    }
  }

  /**
   * Atualiza e executa callbacks de temporizadores com base no relógio real.
   * @private
   */
  _atualizarTimers() {
    const agora = performance.now();
    for (const [nome, t] of this.timers.entries()) {
      // Ignora a checagem se o temporizador estiver pausado
      if (t.pausado) continue;

      if (agora >= t.fimMs) {
        t.acao();
        if (t.repetir) {
          t.fimMs = agora + t.duracaoMs;
        } else {
          this.timers.delete(nome);
        }
      }
    }
  }

  /**
   * Ciclo de execução sincronizado com a taxa de quadros (FPS) ou livre.
   * @private
   */
  _rodar(agora) {
    if (!this._ultimoFrame) this._ultimoFrame = agora;
    const decorrido = agora - this._ultimoFrame;

    // Executa se o FPS for livre (<= 0) ou se atingiu o intervalo do FPS limite
    if (this._fps <= 0 || decorrido >= this._intervaloFps) {
      const dt = decorrido / 1000;

      // Atualiza o marcador de tempo respeitando o resto de divisão se for FPS cravado
      this._ultimoFrame =
        this._fps > 0 && this._intervaloFps > 0
          ? agora - (decorrido % this._intervaloFps)
          : agora;

      this._atualizarTimers();
      this.atualizar(dt);
      this.desenhar();
      this._desenharBotoesTouch();
    }

    if (this._loopId) {
      this._loopId = requestAnimationFrame((t) => this._rodar(t));
    }
  }

  /** Inicia ou despausa o Game Loop compensando o tempo em pausa. */
  retomar() {
    if (!this._loopId) {
      if (this._momentoPausa) {
        // Compensa o tempo que o jogo ficou pausado para não estourar os timers
        const duracaoPausa = performance.now() - this._momentoPausa;
        for (const t of this.timers.values()) {
          t.fimMs += duracaoPausa;
        }
        this._momentoPausa = null;
      }

      this._ultimoFrame = 0;
      this._loopId = requestAnimationFrame((t) => this._rodar(t));
    }
  }

  /** Pausa a execução do Game Loop e congela o tempo dos timers. */
  pausar() {
    if (this._loopId) {
      cancelAnimationFrame(this._loopId);
      this._loopId = null;
      this._momentoPausa = performance.now();
    }
  }

  /** Reinicia o Game Loop. */
  resetar() {
    this.pausar();
    this.retomar();
  }

  /** Alterna a exibição da aplicação para Tela Cheia (Fullscreen). */
  telaCheia() {
    if (!document.fullscreenElement) {
      if (this.canvas.requestFullscreen) this.canvas.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  /**
   * Limpa o canvas preenchendo-o totalmente com uma determinada cor.
   * @param {string} cor - Cor de fundo (CSS).
   */
  limparTela(cor) {
    this.gc.fillStyle = cor;
    this.gc.fillRect(0, 0, this.largura, this.altura);
  }

  /**
   * Cria um temporizador acionado pelo relógio do sistema (performance.now).
   * @param {string} nome - Nome do timer.
   * @param {number} segundos - Intervalo em segundos reais.
   * @param {boolean} repetir - Se verdadeiro, reinicia após disparar.
   * @param {Function} acaoTimerCallback - Função executada no término da contagem.
   */
  iniciarTimer(nome, segundos, repetir, acaoTimerCallback) {
    const agora = performance.now();
    const duracaoMs = segundos * 1000;

    this.timers.set(nome, {
      duracaoMs: duracaoMs,
      fimMs: agora + duracaoMs,
      repetir: repetir,
      acao: acaoTimerCallback,
    });
  }

  /**
   * Cancela e remove um temporizador existente.
   * @param {string} nome - Nome do timer.
   */
  pararTimer(nome) {
    this.timers.delete(nome);
  }

  /**
   * Pausa a contagem de um temporizador mantendo o tempo restante congelado.
   * @param {string} nome - Nome do timer.
   */
  pausarTimer(nome) {
    const t = this.timers.get(nome);
    if (!t || t.pausado) return;

    const agora = performance.now();
    t.tempoRestanteMs = Math.max(t.fimMs - agora, 0);
    t.pausado = true;
  }

  /**
   * Retoma a contagem de um temporizador previamente pausado.
   * @param {string} nome - Nome do timer.
   */
  retomarTimer(nome) {
    const t = this.timers.get(nome);
    if (!t || !t.pausado) return;

    const agora = performance.now();
    t.fimMs = agora + t.tempoRestanteMs;
    t.pausado = false;
    delete t.tempoRestanteMs;
  }

  /**
   * Retorna o tempo restante de um temporizador em segundos reais.
   * @param {string} nome - Nome do timer.
   * @returns {number} Tempo restante em segundos ou -1 caso não exista.
   */
  getTimer(nome) {
    const t = this.timers.get(nome);
    if (!t) return -1;

    // Se estiver pausado, retorna o tempo congelado
    if (t.pausado) {
      return t.tempoRestanteMs / 1000;
    }

    const agora = performance.now();
    const restanteMs = t.fimMs - agora;
    return Math.max(restanteMs / 1000, 0);
  }

  /** Inicia o loop do motor. */
  iniciar() {
    this.retomar();
  }

  /**
   * Carrega uma sequência numerada de imagens para animação de sprites.
   * @param {string} nomeBase - Prefixo do arquivo (ex: "player").
   * @param {number} quantidade - Quantidade total de frames.
   * @param {string} [pasta="imagens/" + nomeBase] - Diretório das imagens.
   * @returns {Array<HTMLImageElement>} Vetor de elementos Image pré-carregados.
   */
  carregarFrames(nomeBase, quantidade, pasta = "imagens/" + nomeBase) {
    let frames = [];
    for (let i = 1; i <= quantidade; i++) {
      let img = new Image();
      img.src = `${pasta}/${nomeBase}_${i}.png`;
      frames.push(img);
    }
    return frames;
  }

  /**
   * Renderiza o frame atual de um Sprite se a imagem estiver totalmente carregada.
   * @param {Sprite} sprite - Instância do Sprite a desenhar.
   */
  desenharSprite(sprite) {
    let img = sprite.getImagem();
    if (img && img.complete && img.naturalWidth !== 0) {
      if (sprite.l > 0 && sprite.a > 0) {
        this.imagem(img, sprite.px, sprite.py, sprite.l, sprite.a);
      } else {
        this.imagem(img, sprite.px, sprite.py);
      }
    }
  }

  /**
   * Cria e registra um novo botão virtual interativo no Canvas.
   * @param {string} id - Identificador único do botão.
   * @param {number} x - Posição X.
   * @param {number} y - Posição Y.
   * @param {number} largura - Largura do botão em pixels.
   * @param {number} altura - Altura do botão em pixels.
   * @param {string} [rotulo=""] - Texto/Símbolo exibido no botão.
   * @param {string|null} [teclaAssociada=null] - Nome da tecla vinculada a ser disparada (ex: "ArrowLeft").
   * @returns {BotaoTouch} Instância do botão criado.
   */
  criarBotaoTouch(
    id,
    x,
    y,
    largura,
    altura,
    rotulo = "",
    teclaAssociada = null,
  ) {
    const btn = new BotaoTouch(
      id,
      x,
      y,
      largura,
      altura,
      rotulo,
      teclaAssociada,
    );
    this.botoesTouch.set(id, btn);
    return btn;
  }

  /**
   * Busca um botão touch registrado através do seu ID.
   * @param {string} id - Identificador único do botão.
   * @returns {BotaoTouch|undefined} A instância do botão encontrado ou undefined.
   */
  getBotaoTouch(id) {
    return this.botoesTouch.get(id);
  }

  /**
   * Remove um botão registrado da coleção.
   * @param {string} id - Identificador único do botão a ser removido.
   */
  removerBotaoTouch(id) {
    this.botoesTouch.delete(id);
  }

  /**
   * Renderiza na tela todos os botões virtuais cadastrados.
   * @private
   */
  _desenharBotoesTouch() {
    if (this.botoesTouch.size === 0) return;

    this.empilhar();
    for (const btn of this.botoesTouch.values()) {
      this.preenchimento(btn.pressionado ? btn.corPressionado : btn.corPadrao);
      this.contorno(2, btn.corBorda);
      this.retangulo(btn.x, btn.y, btn.largura, btn.altura, Estilo.PREENCHIDO);
      this.retangulo(btn.x, btn.y, btn.largura, btn.altura, Estilo.LINHAS);

      if (btn.rotulo) {
        this.preenchimento(btn.corTexto);
        this.gc.textAlign = "center";
        this.gc.textBaseline = "middle";
        this.texto(
          btn.rotulo,
          btn.x + btn.largura / 2,
          btn.y + btn.altura / 2,
          btn.tamanhoFonte,
          "bold",
        );
      }
    }
    this.desempilhar();
  }

  /** Chamado ao fechar/recarregar a aba do navegador. Sobrescreva para salvar dados. */
  acaoAoSair() {}
  /** Chamado na inicialização da aplicação. Sobrescreva para carregar recursos. */
  acaoAoIniciar() {}
  /** Callback para evento keydown. @param {KeyboardEvent} e */
  teclaPressionada(e) {}
  /** Callback para evento keyup. @param {KeyboardEvent} e */
  teclaLiberada(e) {}
  /** Callback para clique do mouse. @param {MouseEvent} e */
  cliqueDoMouse(e) {}
  /** Callback para movimento do mouse. @param {MouseEvent} e */
  movimentoDoMouse(e) {}
  /** Callback para movimento do mouse enquanto arrasta. @param {MouseEvent} e */
  movimentoDoMousePressionado(e) {}
  /** Callback para mousedown. @param {MouseEvent} e */
  mousePressionado(e) {}
  /** Callback para mouseup. @param {MouseEvent} e */
  mouseSolto(e) {}
  /**
   * Atualiza a lógica do jogo. Chamado automaticamente a cada frame antes do método `desenhar()`.
   * Deve ser sobrescrito na classe do jogo.
   *
   * @param {number} [dt] - (Opcional) Delta Time: tempo decorrido desde o último frame em segundos.
   *                        Permite criar movimentações independentes da taxa de FPS (ex: velocidade * dt).
   */
  atualizar(dt) {}
  /** Método de desenho executado a cada frame. Deve ser sobrescrito na classe do jogo. */
  desenhar() {}
}

/**
 * Representa uma entidade gráfica animada (Sprite) baseada em vetores de imagens.
 */
class Sprite {
  /**
   * @param {number} [x=0] - Posição X inicial.
   * @param {number} [y=0] - Posição Y inicial.
   * @param {number} [l=0] - Largura customizada (opcional).
   * @param {number} [a=0] - Altura customizada (opcional).
   */
  constructor(x = 0, y = 0, l = 0, a = 0) {
    /** @type {number} Posição X na tela. */
    this.px = x;
    /** @type {number} Posição Y na tela. */
    this.py = y;
    /** @type {number} Velocidade horizontal. */
    this.vx = 0;
    /** @type {number} Velocidade vertical. */
    this.vy = 0;

    /** @type {number} Largura do Sprite. */
    this.l = l;
    /** @type {number} Altura do Sprite. */
    this.a = a;

    /** @type {boolean} Flag para sinalizar se a dimensão foi definida manualmente. */
    this.tamanhoManual = l > 0 && a > 0;

    /** @type {Array<HTMLImageElement>} Quadro de imagens da animação atual. */
    this.animacaoAtual = [];
    /** @type {number} Índice da imagem atual no array. */
    this.frameAtual = 0;
    /** @type {number} Intervalo de frames do Game Loop para trocar de quadro. */
    this.delayAnimacao = 6;
    /** @type {number} Contador interno de ciclos do motor. */
    this.tickAtual = 0;

    /** @private */
    this._caixaColisao = new Retangulo2D(x, y, l, a);
  }

  /**
   * Define manualmente a largura e a altura do Sprite.
   * @param {number} l - Nova largura.
   * @param {number} a - Nova altura.
   */
  setTamanho(l, a) {
    this.l = l;
    this.a = a;
    this.tamanhoManual = true;
  }

  /**
   * Obtém a imagem do frame ativo.
   * @returns {HTMLImageElement|null} Imagem atual ou null.
   */
  getImagem() {
    return this.animacaoAtual && this.animacaoAtual.length > 0
      ? this.animacaoAtual[this.frameAtual]
      : null;
  }

  /**
   * Define o conjunto de frames para a animação do sprite.
   * @param {Array<HTMLImageElement>} listaImagens - Array de imagens carregadas.
   */
  setAnimacao(listaImagens) {
    if (this.animacaoAtual !== listaImagens) {
      this.animacaoAtual = listaImagens;
      this.frameAtual = 0;
      this.tickAtual = 0;

      // Reseta as dimensões para auto-detecção apenas se não foram fixadas manualmente
      if (!this.tamanhoManual) {
        this.l = 0;
        this.a = 0;
      }
    }
  }

  /**
   * Ajusta a velocidade de movimentação.
   * @param {number} vx - Componente X da velocidade.
   * @param {number} vy - Componente Y da velocidade.
   */
  setVelocidade(vx, vy) {
    this.vx = vx;
    this.vy = vy;
  }

  /**
   * Redefine a posição do Sprite.
   * @param {number} x - Nova posição X.
   * @param {number} y - Nova posição Y.
   */
  setPosicao(x, y) {
    this.px = x;
    this.py = y;
  }

  /**
   * Atualiza posição e avança o ciclo da animação.
   */
  atualizar() {
    this.px += this.vx;
    this.py += this.vy;

    if (this.animacaoAtual.length > 1) {
      this.tickAtual++;
      if (this.tickAtual >= this.delayAnimacao) {
        this.tickAtual = 0;
        this.frameAtual = (this.frameAtual + 1) % this.animacaoAtual.length;
      }
    }

    // Auto-detecta tamanho apenas se o tamanho manual não estiver ativo
    let imgAtual = this.getImagem();
    if (
      !this.tamanhoManual &&
      imgAtual &&
      imgAtual.naturalWidth > 0 &&
      (this.l === 0 || this.a === 0)
    ) {
      this.l = imgAtual.naturalWidth;
      this.a = imgAtual.naturalHeight;
    }
  }

  /**
   * Retorna a caixa delimitadora (AABB) do Sprite.
   * @returns {Retangulo2D} Objeto de colisão atualizado.
   */
  getBordas() {
    this._caixaColisao.x = this.px;
    this._caixaColisao.y = this.py;
    this._caixaColisao.largura = this.l;
    this._caixaColisao.altura = this.a;
    return this._caixaColisao;
  }

  /**
   * Verifica colisão simples entre este Sprite e outro Sprite.
   * @param {Sprite} outroSprite - O outro objeto Sprite.
   * @returns {boolean} Verdadeiro em caso de intersecção.
   */
  colisao(outroSprite) {
    return (
      this.px < outroSprite.px + outroSprite.l &&
      this.px + this.l > outroSprite.px &&
      this.py < outroSprite.py + outroSprite.a &&
      this.py + this.a > outroSprite.py
    );
  }
}