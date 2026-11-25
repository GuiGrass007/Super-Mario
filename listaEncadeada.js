class NoPersonagem {
  constructor(personagem) {
    this.personagem = personagem;
    this.proximo = null;
  }
}

class ListaPersonagens {
  constructor() {
    this.inicio = null;
    this.tamanho = 0;
  }

  inserirInicio(personagem) {
    const novoNo = new NoPersonagem(personagem);
    novoNo.proximo = this.inicio;
    this.inicio = novoNo;
    this.tamanho++;
  }

  
  inserirFim(personagem) {
    const novoNo = new NoPersonagem(personagem);
    if (!this.inicio) {
      this.inicio = novoNo;
    } else {
      let atual = this.inicio;
      while (atual.proximo) {
        atual = atual.proximo;
      }
      atual.proximo = novoNo;
    }
    this.tamanho++;
  }


  remover(personagemAlvo) {
    if (!this.inicio) return false;

    if (this.inicio.personagem === personagemAlvo) {
      this.inicio = this.inicio.proximo;
      this.tamanho--;
      return true;
    }

    let anterior = this.inicio;
    let atual = this.inicio.proximo;

    while (atual) {
      if (atual.personagem === personagemAlvo) {
        anterior.proximo = atual.proximo;
        this.tamanho--;
        return true;
      }
      anterior = atual;
      atual = atual.proximo;
    }

    return false;
  }


  paraCada(callback) {
    let atual = this.inicio;
    while (atual) {
      const proximoNo = atual.proximo; 
      callback(atual.personagem);
      atual = proximoNo;
    }
  }
}