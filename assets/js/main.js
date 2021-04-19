/**
 * Utils
 */
String.merge = (ss,...pp)=> [].concat(ss).map( (s,i)=> s+(i in pp?pp[i]:'') ).join('')
const $ = ( sel, target = document )=> typeof sel == 'string' ? target.querySelector( sel ) : sel
const $$ = ( sel, target = document )=> [...target.querySelectorAll( sel )]

// on`scroll`( e=> )
// on`click`( e=> , $myBtn )
// $$().map( el=> on`click`( e=> , el ) )
const on = (ss,...pp)=> ( fn, el = document, capture = false )=>
	el.addEventListener( String.merge(ss,...pp), fn, capture )


/**
 * Important nodes selection
 */
const $body = $('body')
const $topbar = $('#topbar')
const $header = $('#header')
const $navbar = $('#navbar')
const $footer = $('#footer')


/**
 * Navbar links active state on scroll
 */
let $navs = $$('#navbar .scrollto')
const activeNav = () => {
	let position = window.scrollY + 200
	$navs.forEach($nav => {
	if (!$nav.hash) return
	let $section = $($nav.hash)
	if (!$section) return
	if (position >= $section.offsetTop && position <= ($section.offsetTop + $section.offsetHeight)) {
		$nav.classList.add('active')
	} else {
		$nav.classList.remove('active')
	}
	})
}
on`scroll`( activeNav )
on`load`( activeNav, window )

/**
 * Scrolls to an element with header offset
 */
const scrollto = el=> el &&
	window.scrollTo({
		top: $(el).offsetTop - $header.offsetHeight,
		behavior: 'smooth'
	})


/**
 * Toggle .scrolled class on body when page is scrolled a certain threshold
 */
const headerScrolled = e=>
	$body.classList.toggle( 'scrolled', window.scrollY > 100 )

on`scroll`( headerScrolled )
on`load`( headerScrolled, window )



// // const el = document.querySelector("#header")
const Region = ( margin, threshold = 0,
	handlers = {}
,	obs = new IntersectionObserver(
		arr=> arr.map( e=>
				Object.keys( handlers )
					.filter( sel=> e.target.matches(sel) )
					.map( sel=> handlers[sel].map( fn=> fn(e) ) )
			)
	,	{ rootMargin: margin, threshold }//"-100px 0px 0px 0px"}
	)
)=> ({
	on( sel, fn )
	{
		handlers[sel] = handlers[sel] || []
		handlers[sel].push( fn )
		document.querySelectorAll(sel).forEach( el=> obs.observe(el) )
		return this
	}
})
// const observer = 
// new IntersectionObserver( 
// 	([e]) => console.log(e.intersectionRatio )|| e.target.classList.toggle("header-scrolled", e.intersectionRatio == 0),
// 	{thresholds: 1, rootMargin: "-100px 0px 0px 0px"}
// )

// observer.observe(el)
// let dbgdiv = document.createElement('div')
// dbgdiv.style = `border: 1px solid red; position:fixed; z-index: 1000; top: 1px; right: 0px; bottom: 0px; left: 0px;`
// document.body.append( dbgdiv )
// const visibleRegion = 
// Region( -100,0,0,0 )
// Region( '50%',0,0,0 )

const $headerStyle = getComputedStyle($header)

if( $headerStyle.position == 'sticky' )
	Region( `-${parseFloat($headerStyle.top)+1}px 0px 0px 0px`, [0,1] )
		.on( `#header`, e=> {
			// console.log(e.intersectionRatio != 1)
			e.target.classList.toggle("header-stuck", e.intersectionRatio != 1)
			if( $topbar )
				$topbar.classList.toggle("topbar-scrolled", e.intersectionRatio != 1)
		})


// background-image: radial-gradient( transparent, black), url(assets/img/backgrounds/w1920/abstract-2178720.jpg);
// background-blend-mode: luminosity, normal;
// background-attachment: fixed;
// const bgs = {
// 	hero: '.../img/backgrounds/w1920/abstract-2178720.jpg'
// ,	about: '.../img/backgrounds/w1920/piano-4487573.jpg'
// ,	gallery: '.../img/backgrounds/w1920/piano-2308370.jpg'
// ,	contact: '.../img/backgrounds/h1280/piano-1143734.jpg'
// }

// let dbgdiv = document.createElement('div')
// dbgdiv.style = `border: 1px solid red; position:fixed; z-index: 1000; pointer-events: none;
// top: 70px; right: 0px; bottom: 100px; left: 0px;`
// document.body.append( dbgdiv )
// window.sectionRegion = 

Region( '-70px 100px 0px 100px', 1 ).on('[data-body-bg]', e=> {
		// console.log( e.intersectionRatio, e.target, 'visible:',  e.isVisible, 'Intersecting:',  e.isIntersecting )
	if(e.isIntersecting) {
		// e.intersectionRatio > 0 && ()
		$body.style.setProperty('--body-bg', `url("${e.target.dataset.bodyBg}")` )
		e.target.dataset.bodyBgPosition
			? $body.style.backgroundPosition = e.target.dataset.bodyBgPosition
			: $body.style.removeProperty( 'background-position' )
	}
})


const altCss = new CSSStyleSheet()
document.adoptedStyleSheets = [altCss]

const shortcuts = {
	is(e){ if( e.altKey && (e.code in this) ){ e.preventDefault(); return true } },
	KeyA(){ altCss.replaceSync(`body:after { display: none }`) },
	KeyB(){ altCss.replaceSync(`body:after {}`) },
	KeyC(){ altCss.replaceSync(`body:after { background-image: radial-gradient(transparent, black) }`) },
	KeyE(){ altCss.replaceSync(`body:after { backdrop-filter: saturate(0) }`) },
	KeyF(){ altCss.replaceSync(`body:after { backdrop-filter: sepia(0.5) saturate(2) }`) },
	
	KeyG(){ altCss.replaceSync(`body:after { background-position-x: 0% !important }`) },
	KeyD(){ altCss.replaceSync(`body:after { background-position-x: 100% !important }`) },
}
// window.addEventListener('keydown', e=>
// 	shortcuts.is(e) && shortcuts[e.code]()
// , true )

on`keydown`( e=>
	shortcuts.is(e) && shortcuts[e.code]( e )
, window, true )



/**
 * Back to top button
 */
let $topBtn = $('.back-to-top')
if ($topBtn) {
	const toggleTopBtn = ()=> 
		$topBtn.classList.toggle( 'active', window.scrollY > 100 )
	
	on`scroll`( toggleTopBtn )
	on`load`( toggleTopBtn, window )

}

/**
 * Mobile nav toggle
 */
const $navToggle = $('.mobile-nav-toggle')
const toggleMobile = e=>
{
    $navbar.classList.toggle('navbar-mobile')
    $navToggle.classList.toggle('bi-list')
    $navToggle.classList.toggle('bi-x')
}
$('.mobile-nav-toggle').onclick = toggleMobile


/**
 * Mobile nav dropdowns activate
 */
$$('.navbar .dropdown > a').map( el=> el.onclick = e=> {
	if( $navbar.classList.contains('navbar-mobile') )
	{
		e.preventDefault()
		e.target.nextElementSibling.classList.toggle('dropdown-active')
	}
})


/**
 * Scroll to #hash of .scrollto's
 */
$$('.scrollto').map( el=> el.onclick = e=> {
	if( $(e.target.hash) )
	{
		e.preventDefault()

		if( $navbar.classList.contains('navbar-mobile') )
			toggleMobile()

		scrollto( e.target.hash )
	}
})


/**
 * Scroll to #hash in the url
 */
on`load`( e=>
	window.location.hash
		&& scrollto( window.location.hash )
, window )



/**
 * lightbox for gallery
 */
const galleryLightbox = GLightbox({
	selector: '.gallery-lightbox'
})
