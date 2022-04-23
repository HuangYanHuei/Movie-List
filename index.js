const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
//計錄分頁
let nowPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

//印出第一頁卡片清單電影
axios
  .get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieCard(getMoviesByPage(1))
  })
//印出電影卡片清單
function renderMovieCard(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="movie-img">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
      `
  })
  dataPanel.innerHTML = rawHTML
}
//印出電影列表清單
function renderMovieList(data) {
  let rawHTML = ''
  rawHTML += `<ul class="list-group">`
  data.forEach(item => {
    rawHTML += `
  <li class="list-group-item d-flex justify-content-between">
  <h5 class="card-title">${item.title}</h5>
  <div>
    <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
      data-bs-target="#movie-modal" data-id="${item.id}">More</button>
    <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
  </div>
  </li>
    `
  })
  rawHTML += `</ul>`
  dataPanel.innerHTML = rawHTML
}

//計算分頁器
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
//印出分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}
//分頁器監聽
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  nowPage = page
  checkCardList(nowPage)
})
//modal && +按鈕
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})
//電影modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios
    .get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImage.innerHTML = `
      <img src="${POSTER_URL + data.image}" class="card-img-top" alt="movie-img">
      `
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
    })
}
//加到我的最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
//搜尋
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword.length) {
    return alert('Please enter a valid string!')
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  nowPage = 1
  if (filteredMovies.length === 0) return alert('無搜尋結果')
  renderPaginator(filteredMovies.length ? filteredMovies.length : movies.length)
  checkCardList(nowPage)
})
//切換卡片與列表
searchForm.addEventListener('click', function onCardListIcon(event) {
  if (event.target.matches('#card-icon')) {
    dataPanel.dataset.mode = 'card-mode'
    checkCardList(nowPage)
  } else if (event.target.matches('#list-icon')) {
    dataPanel.dataset.mode = 'list-mode'
    checkCardList(nowPage)
  }
})
//確認是卡片或是列表後印出
function checkCardList(nowPage) {
  if (dataPanel.dataset.mode === 'card-mode') {
    renderMovieCard(getMoviesByPage(nowPage))
  } else if (dataPanel.dataset.mode === 'list-mode') {
    renderMovieList(getMoviesByPage(nowPage))
  }
}
