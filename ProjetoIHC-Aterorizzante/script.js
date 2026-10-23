(() => {
  const norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const header = document.querySelector('.header');
  const aviso = document.getElementById('aviso');
  let timer;

  function mostrarAviso(msg) {
    aviso.textContent = msg;
    aviso.classList.add('aviso--visivel');
    clearTimeout(timer);
    timer = setTimeout(() => aviso.classList.remove('aviso--visivel'), 2500);
  }

  // Links que ainda não têm página: avisa em vez de pular para o topo
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href="#"]');
    if (!a) return;
    e.preventDefault();
    mostrarAviso('Esta página ainda não está disponível.');
  });

  // Menu do cabeçalho no celular
  const btnMenu = document.querySelector('.header__menu');
  btnMenu.addEventListener('click', () => {
    const aberto = header.classList.toggle('header--aberto');
    btnMenu.setAttribute('aria-expanded', aberto);
    btnMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });

  // Carrosséis
  const carrosseis = [...document.querySelectorAll('.carrossel')];
  function atualizarSetas() {
    carrosseis.forEach(c => {
      const l = c.querySelector('.carrossel__lista');
      const [ant, prox] = c.querySelectorAll('.carrossel__seta');
      const rola = l.scrollWidth > l.clientWidth + 1;
      ant.hidden = prox.hidden = !rola;
      ant.disabled = l.scrollLeft <= 1;
      prox.disabled = l.scrollLeft + l.clientWidth >= l.scrollWidth - 1;
    });
  }
  carrosseis.forEach(c => {
    const l = c.querySelector('.carrossel__lista');
    const [ant, prox] = c.querySelectorAll('.carrossel__seta');
    const passo = () => l.clientWidth * 0.8;
    ant.addEventListener('click', () => l.scrollBy({ left: -passo(), behavior: 'smooth' }));
    prox.addEventListener('click', () => l.scrollBy({ left: passo(), behavior: 'smooth' }));
    l.addEventListener('scroll', atualizarSetas, { passive: true });
  });
  window.addEventListener('resize', atualizarSetas);

  // Busca + filtro por categoria
  const campo = document.getElementById('pesquisa');
  const secoes = [...document.querySelectorAll('.secao')];
  const semRes = document.getElementById('sem-resultados');
  const btnFiltro = document.querySelector('.header__filtrar');
  const painel = document.getElementById('painel-filtro');
  let categoria = 'todos';

  function aplicar() {
    const termo = campo.value.trim();
    const q = norm(termo);
    let total = 0;
    secoes.forEach(sec => {
      const naCategoria = categoria === 'todos' || sec.dataset.categoria === categoria;
      let visiveis = 0;
      sec.querySelectorAll('.card').forEach(card => {
        const ok = norm(card.textContent).includes(q);
        card.hidden = !ok;
        if (ok) visiveis++;
      });
      sec.hidden = !naCategoria || visiveis === 0;
      if (!sec.hidden) total += visiveis;
    });
    semRes.hidden = total > 0;
    if (!total) semRes.textContent = termo
      ? `Nenhuma criatura encontrada para “${termo}”. Tente outro nome ou limpe o filtro.`
      : 'Nenhuma criatura encontrada.';
    atualizarSetas();
  }

  document.querySelector('.busca').addEventListener('submit', e => e.preventDefault());
  campo.addEventListener('input', aplicar);

  function fecharPainel(devolverFoco) {
    painel.hidden = true;
    btnFiltro.setAttribute('aria-expanded', 'false');
    if (devolverFoco) btnFiltro.focus();
  }
  btnFiltro.addEventListener('click', () => {
    const abrir = painel.hidden;
    painel.hidden = !abrir;
    btnFiltro.setAttribute('aria-expanded', abrir);
  });
  painel.addEventListener('click', e => {
    const op = e.target.closest('.filtro__opcao');
    if (!op) return;
    categoria = op.dataset.filtro;
    painel.querySelectorAll('.filtro__opcao').forEach(b =>
      b.setAttribute('aria-pressed', b === op));
    fecharPainel(true);
    aplicar();
  });
  document.addEventListener('click', e => {
    if (!painel.hidden && !e.target.closest('.filtro')) fecharPainel(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !painel.hidden) fecharPainel(true);
  });

  aplicar();
})();
