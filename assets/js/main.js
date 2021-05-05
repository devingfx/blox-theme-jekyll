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
const bodyStyle = getComputedStyle($body)

const headerScrolled = e=>
	$body.classList.toggle( 'scrolled', window.scrollY > parseFloat(bodyStyle.getPropertyValue('--scrolled-offset')) )

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
,	set helper( v )
	{
		if( v )
		{
			let div = document.createElement('div')
			let [ top, right, bottom, left ] = margin.split(/\s+/).map( parseFloat )
			div.style = `border: 1px solid red; position:fixed; z-index: 1000; pointer-events: none;
			top: ${-top}px; right: ${-right}px; bottom: ${-bottom}px; left: ${-left}px;`
			document.body.append( div )
			this._helper = div
		}
		else if( this._helper )
		{
			this._helper.remove()
		}
	}
})

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


const ImageFader = $el=> {
	
	if( !$el ) return
	
	let nextState, i
	,	threshold = 1000
	,	images = [...document.querySelectorAll(`[data-body-bg]`)]
					.map( n=> n.dataset.bodyBg )
					.map( src=> (i = new Image, i.src = src, i) )
	
	const delay = ()=> 
					parseFloat(
						getComputedStyle($el).transition.split(/,\s*/)
							.map( s=> s.split(' ') )
							.filter( a=> a[0] == 'background' )
							.map( a=> a[1] )
							[0]
					 ) * 1100
	
	const doFadeBg = ()=> {
		
		let { bodyBg, bodyBgPosition } = nextState
		nextState = null
		
		$el.toggleAttribute( 'fading', true )
		
		$el.style.setProperty( 'background-image', `url("${bodyBg}")` )
		
		bodyBgPosition
			? $el.style.backgroundPosition = bodyBgPosition
			: $el.style.removeProperty( 'background-position' )
		
		setTimeout( fadeEnd, delay() )
		
	}

	const fadeEnd = ()=> {
		// console.log(e)
		$el.removeAttribute('fading')
		nextState && fadeNext( nextState )
	}
	// on`transitionend`( e=>
	// 	e.target == $body
	// 	&& e.propertyName == "background-image"
	// 		&& fadeEnd( e )
	// )
	
	const fadeNext = ( state )=> {

		nextState = state
		if( $el.hasAttribute('fading') )
			return
		
		$el.toggleAttribute( 'fading', true )
		setTimeout( doFadeBg, threshold )
	}

	Region( '-70px 100px 0px 100px', 1 )
		.on('[data-body-bg]', e=> 
			// console.log( e.intersectionRatio, e.target, 'visible:',  e.isVisible, 'Intersecting:',  e.isIntersecting )||
			e.isIntersecting
				&& fadeNext( e.target.dataset )
		)
		// .helper = true

}
let $fader = $(`.image-fader`)
ImageFader( $fader )

// var nextImage
// const fadeBg = ({ bodyBg, bodyBgPosition })=> {

// 	if( $body.hasAttribute('fading') )
// 		return nextImage = { bodyBg, bodyBgPosition }
	
// 	bodyBg = nextImage ? nextImage.bodyBg : bodyBg
// 	bodyBgPosition = nextImage ? nextImage.bodyBgPosition : bodyBgPosition
// 	nextImage = null
// 	$body.setAttribute('fading','')
// 	$body.style.setProperty('background-image', `url("${bodyBg}")` )
// 	bodyBgPosition
// 		? $body.style.backgroundPosition = bodyBgPosition
// 		: $body.style.removeProperty( 'background-position' )
// }

// const imageFinish = e=> {
// 	console.log(e)
// 	document.body.removeAttribute('fading')
// 	nextImage && fadeBg( nextImage )
// }
// on`transitionend`( e=>
// 	e.target == document.body
// 	&& e.propertyName == "background-image"
// 		&& imageFinish( e )
// )

// let dbgdiv = document.createElement('div')
// dbgdiv.style = `border: 1px solid red; position:fixed; z-index: 1000; pointer-events: none;
// top: 70px; right: 0px; bottom: 100px; left: 0px;`
// document.body.append( dbgdiv )
// window.sectionRegion = 

// Region( '-70px 100px 0px 100px', 1 ).on('[data-body-bg]', e=> {
// 		// console.log( e.intersectionRatio, e.target, 'visible:',  e.isVisible, 'Intersecting:',  e.isIntersecting )
// 	if(e.isIntersecting) {
// 		// e.intersectionRatio > 0 && ()
// 		fadeBg( e.target.dataset )
// 		// $body.style.setProperty('background-image', `url("${e.target.dataset.bodyBg}")` )
// 		// e.target.dataset.bodyBgPosition
// 		// 	? $body.style.backgroundPosition = e.target.dataset.bodyBgPosition
// 		// 	: $body.style.removeProperty( 'background-position' )
// 	}
// })


// const altCss = new CSSStyleSheet()
// document.adoptedStyleSheets = [altCss]

// const shortcuts = {
// 	is(e){ if( e.altKey && (e.code in this) ){ e.preventDefault(); return true } },
// 	KeyA(){ altCss.replaceSync(`body:after { display: none }`) },
// 	KeyB(){ altCss.replaceSync(`body:after {}`) },
// 	KeyC(){ altCss.replaceSync(`body:after { background-image: radial-gradient(transparent, black) }`) },
// 	KeyE(){ altCss.replaceSync(`body:after { backdrop-filter: saturate(0) }`) },
// 	KeyF(){ altCss.replaceSync(`body:after { backdrop-filter: sepia(0.5) saturate(2) }`) },
	
// 	KeyG(){ altCss.replaceSync(`body:after { background-position-x: 0% !important }`) },
// 	KeyD(){ altCss.replaceSync(`body:after { background-position-x: 100% !important }`) },
// }
// // window.addEventListener('keydown', e=>
// // 	shortcuts.is(e) && shortcuts[e.code]()
// // , true )

// on`keydown`( e=>
// 	shortcuts.is(e) && shortcuts[e.code]( e )
// , window, true )



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
