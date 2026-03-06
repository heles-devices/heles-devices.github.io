//load the GLTF animation resources from local storage
import * as THREE from './three.module.js';
import { GLTFLoader } from './gltfloader.js';
import { OrbitControls } from './orbitcontrols.js';
//Constants for functional purposes
//current language / languages and fall back language (if no valid language selected)
let lang="ro";
const lang_opt=["ro","en","it","fr"], lang_fall="en";
let user="", user_fall="Anonymous";
let nav_page = 0; // 0 for introduction page (home), 1...6 for description pages
let theme = 1;//currently used theme, at start the darker one
//history related data
const pageMap = {
    0: "home",
    1: "my_journey",
    2: "experiences",
    3: "profile",
    4: "academics",
    5: "projects",
    6: "reflections"
};
// Create a reverse map for quick lookup when loading the page
const nameToNr = Object.fromEntries(Object.entries(pageMap).map(([k, v]) => [v, parseInt(k)]));
//store the title of the pages according to selected language and image of that section
let pageTitles = [];
//flag for a precedent shuttle drag event
let shuttleDragged = false;
const shuttleDragAdvert = document.getElementById("drag_shuttle");
const contents = document.getElementById("contents");
const header = document.getElementById("header");
let sectionDivs={};
let contentDivs = (contents.querySelectorAll("[id^='content_']"));
contentDivs.forEach(contentItem=>{
    var indOf = (contentItem.id).replace("content_","");
    if(indOf>1){
    sectionDivs[indOf]=(contentItem.querySelectorAll(`[id^='c${indOf}_div']`));}
})
//Function to help generate the content of the 6 pages with details
let gShake={}, randVec=[0,0,0,0,0];
window.gShake = gShake; // expose globally for debugging
function generateContent(language){
    //WARNING!! For each cabinet at least one section key is needed (even if redundant) 
    Object.entries(sectionDivs).forEach(([listKey, sectionList])=>{
        let tDict = add_txt[listKey];
        if(Object.keys(tDict).length!==0){
        sectionList.forEach(contentItem=>{
            //clean up internal divs previously added dynamically
            var divList=contentItem.querySelectorAll(":scope>div");
            divList.forEach(elem=>contentItem.removeChild(elem));
            //populate with new div cabinets if the cabinets exist
            var cabKey = `cabinet${(contentItem.id).replace(`c${listKey}_div`,"")}`;
            if((cabKey in tDict)){
                var container = document.createElement("div");
                container.classList.add("containerX");
                container.innerHTML+=sec_solver(tDict[cabKey],language,listKey);
                contentItem.appendChild(container);
            }
        });
        //populate the gShake dict with the group <g> of SVG elements for animation purposes
        gShake[listKey]=(document.getElementById(`content_${listKey}`)).querySelectorAll("g");
        //filter out all g elements not having the requires attributes
        gShake[listKey] = Array.from(gShake[listKey]).filter(item => 
            item.hasAttribute("data-temp") && item.hasAttribute("data-ang")
        );

        }});
        //we define 5 random values at a time to control the move of all the g elements
        //each g element will get one random value from an assigned index

console.log("Page 2 g elements:", gShake[2]?.length);
console.log("Page 3 g elements:", gShake[3]?.length);


    requestAnimationFrame(() => checkTallDivs());
}

function sec_solver(dict_data, language, tType){
    if(!dict_data){console.error("Dictionary argument null or invalid!"); return "";}
    var htmlData ="";
    if("h" in dict_data)htmlData+=`<H2>${dict_data["h"][language]}</H2>`;
    //create list of secX dictionaries
    var secList = Object.fromEntries(
        Object.entries(dict_data).filter(([key]) => {
            const pattern = /^sec([1-9][0-9]*)$/;
            return pattern.test(key);
        }));
    if(Object.keys(secList).length!==0){
        Object.values(secList).forEach(sectionData => {
            // Work with the inner dictionary
            htmlData+='<div class="containerX">'+ sec_solver(sectionData,language, tType) + "</div>";
        });
    }
    //create list of bX dictionaries
    var bList = Object.fromEntries(
        Object.entries(dict_data).filter(([key]) => {
            const pattern = /^b([1-9][0-9]*)$/;
            return pattern.test(key);
        }));
    if(Object.keys(bList).length!==0){
        Object.values(bList).forEach(sectionData => {
            // Work with the inner dictionary
            htmlData+='<div class="cx_box">'+ box_solver(sectionData,language, tType)  + "</div>";//+ my_magic_button
        });
    }
    return htmlData;
}


function box_solver(dict_data, language, tType){
    //maximum 4 values charts accepted
    var loc_note={"ro":"Notă:&nbsp;","en":"Note:&nbsp;","it":"Nota:&nbsp;","fr":"Note:&nbsp;"}
    var loc_desc={"ro":"Descriere:&nbsp;","en":"Description:&nbsp;","it":"Descrizione:&nbsp;","fr":"Description:&nbsp;"}
    var loc_yearAbs={"ro":"An absolvire:&nbsp;","en":"Graduation year:&nbsp;","it":"Anno di laurea:&nbsp;","fr":"Année de remise des diplômes :"}
    var loc_inst={"ro":"Instituție:&nbsp;","en":"Institution:&nbsp;","it":"Istituzione:&nbsp;","fr":"Institution:&nbsp;"}
    var loc_type={"ro":"Tip:&nbsp;","en":"Type:&nbsp;","it":"Tipo:&nbsp;","fr":"Type:&nbsp;"}
    var spans=[];
    ["m1","m2","m3","m4"].forEach(item=>(item in dict_data)?spans.push(dict_data[item]):null)
    var html_string="", gaugeStr="";
    var values = ("val" in dict_data)?(dict_data["val"].split(",")):[];
    var valuesLen=values.length; var spansLen = spans.length;
    var boxData = {"title":"","type":"","inst":"","desc":"","note":"","year":''}
    for (const boxKey in boxData) {
        boxData[boxKey] = (boxKey in dict_data)?
        `${dict_data[boxKey].constructor == Object && language in dict_data[boxKey]?(dict_data[boxKey][language]):dict_data[boxKey]}`:"";
    }
    if(valuesLen==1){
        const preReplace = gauges["frame"].replace("<g></g>",gauges["2_sides"]);
        const dataAngVal = 24*(values[0]-5);
        const dataAttStr = `<g data-ang="${dataAngVal}" data-temp="0.5" transform="rotate(${dataAngVal} 256 256)">`;
        gaugeStr = preReplace.replace("<g>", dataAttStr);
    }
    if(valuesLen==3){gaugeStr=gauges["frame"].replace("<g></g>",gauges["3_sides"]+`<polygon points="256, ${256-18*values[0]} ${256+0.866*18*values[1]},${256+0.5*18*values[1]}  ${256-0.866*18*values[2]},${256+0.5*18*values[2]}" fill="green" fill-opacity="0.5" stroke="black" />`)}
    if(valuesLen==4){gaugeStr=gauges["frame"].replace("<g></g>",gauges["4_sides"]+`<polygon points="256, ${256-18*values[0]} ${256+18*values[1]},256  256,${256+18*values[2]} ${256-18*values[3]},256" fill="green" fill-opacity="0.5" stroke="black" />`)}
    //if measurement spans provided, compute the texts to be added in svg
    var svgText="", fontSize=32, boxSquare=512, textMargin=8, textWidth;
    if(['3','2'].includes(tType) && ((valuesLen==1 && spansLen==2)||valuesLen>1 && spansLen==valuesLen)){
        for(var ind=0;ind<spansLen;ind++){
            textWidth=spans[ind][language].length*fontSize*0.55;
            var xPos,yPos;
            xPos=(spansLen==2?(ind==0?textMargin:(boxSquare-textMargin-textWidth)):
            spansLen==3?(ind==0?((boxSquare-textWidth)/2):(ind==1?(boxSquare-textWidth-textMargin):textMargin)):
            spansLen==4?(ind==0?((boxSquare-textWidth)/2):(ind==1?(boxSquare-textWidth-textMargin):(ind==2?((boxSquare-textWidth)/2):textMargin))):null);
            yPos=(spansLen==2?(boxSquare-textMargin):
            (spansLen==3?(ind==0?(textMargin+fontSize):(boxSquare-textMargin)):
            (spansLen==4?(ind==0?(textMargin+fontSize):(ind==2?(boxSquare-textMargin):((boxSquare-fontSize)/2))):null)));//-fontSize
            svgText+=`<text x="${xPos}" y="${yPos}" font-size="${fontSize}" fill="brown" stroke="blue" font-family="monospace">${spans[ind][language]}</text>`;
        }  
        gaugeStr=gaugeStr.replace("</svg>",`${svgText}</svg>`);
    }
    html_string += boxData["title"]?`<H3>${boxData["title"]}</H3>`:"";
    //insert image if provided
    html_string += (['6'].includes(tType) && 'image' in dict_data)?
        ('<div>'+dict_data['image'])+'</div>':"";
    html_string += gaugeStr?(`<div>${gaugeStr}</div>`):"";
    html_string += (['4','5'].includes(tType))?
        (boxData["year"]?`<p>${loc_yearAbs[language]}${boxData["year"]}</p>`:"")+
        (boxData["inst"]?`<p>${loc_inst[language]}${boxData["inst"]}</p>`:"")+
        (boxData["type"]?`<p>${loc_type[language]}${boxData["type"]}</p>`:""):"";
    html_string += (boxData["desc"]?(`<p lang="${language}">${(['3','4','5'].includes(tType))?loc_desc[language]:""}${boxData["desc"]}</p>`):"");
    html_string += (boxData["note"]?(`<p lang="${language}">${loc_note[language]}${boxData["note"]}</p>`):"");
    //When using multiple svg-s, make sure the first svg is the gauge, for correct replacement
    //Add magic button for expand/collapse functionality
    //Check if inside the dictionary we have im# key and if so clone the hidden images to cx_box
    const addPict = ('im#' in dict_data)?dict_data['im#']:null;
    if (addPict){
        var listPict=addPict.split(",");
        for(let pict in listPict){
            var resPict = document.querySelector(`img[data-ind=\"${listPict[pict]}\"]`);
            if (resPict){
                var clonePict = "<div class='im-cont'>"+(resPict.outerHTML)+"</div>";
                html_string +=clonePict;
            }
        }
        //console.log(html_string);
    }
    return html_string;
}

/////////////// ADDED NEW CODE FOR HEIGHT ISSUE //////////////
// Expand/Collapse functions
function toggleExpand(btnElement) {
    const box = btnElement.closest('.cx_box');
    box.classList.toggle('expanded');
    if(box.classList.contains('expanded')) {
        box.focus();
    }
}
// Make toggleExpand available to inline onclick handlers (because of ES6 module scope)
window.toggleExpand = toggleExpand;
// A function that decides if the button must be displayed or not
function checkTallDivs() {
    // Check all boxes that have the button inside
    document.querySelectorAll('.cx_box').forEach(box => {
        // Allow focus (for self shrinking procedure)
        box.setAttribute('tabindex', '0');
        // Ensure blur listener added only once
        if (!box.dataset.hasBlur) {
            box.addEventListener('blur', function() {
                // Small timeout to allow button click to register before closing
                setTimeout(() => this.classList.remove('expanded'), 200);
            });
            box.dataset.hasBlur = '1';
        }
        // Determine if the content is taller than threshold
        const THRESHOLD = 300;
        const isTall = box.scrollHeight > THRESHOLD;
        let butExists = box.querySelector('.magic-btn');
        if (isTall) {
            // Create the button only if it doesn't exist, using DOM methods
            if (!butExists) {
                const btn = document.createElement('div');
                btn.className = 'magic-btn';
                btn.addEventListener('click', function() { toggleExpand(this); });
                box.appendChild(btn);
            }
            box.classList.add('is-tall');
        } else {
            // Remove existing button if no longer needed
            if (butExists) butExists.remove();
            box.classList.remove('is-tall');
        }
    });
}


/////////////////////////////////////////////////////////////////
//////////////////////// INTRO ANIMATIONS ///////////////////////
const skyCanvas = document.getElementById('skyCanvas');
const skyCTX = skyCanvas.getContext('2d');
// Draw background first (callable at download event)
function applyDynamicBackground() {
    const width = 1024;
    const height = 1024;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    // 1. Fill with a deep base color
    ctx.fillStyle = '#02020a'; 
    ctx.fillRect(0, 0, width, height);
    // 2. Add "Splashes" of color (Nebulae)
    const colors = [
        { c: 'rgba(20, 30, 80, 0.4)', x: 0.2, y: 0.3 }, // Deep Blue
        { c: 'rgba(40, 10, 60, 0.3)', x: 0.7, y: 0.2 }, // Deep Purple
        { c: 'rgba(10, 40, 50, 0.3)', x: 0.5, y: 0.8 }  // Teal tint
    ];
    colors.forEach(splash => {
        const x = splash.x * width;
        const y = splash.y * height;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, width * 0.6);
        grad.addColorStop(0, splash.c);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    });
    // 3. Add very subtle grain (The "Wheat" fix)
    // We reduce the frequency by drawing larger "dust" particles 
    // or using lower opacity
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2;
        const alpha = Math.random() * 0.2; // Very faint
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fillRect(x, y, size, size);
    }
    // 4. Apply to #content_0
    const dataURL = tempCanvas.toDataURL('image/png');
    const target = document.getElementById('content_0');
    if (target) {
        target.style.backgroundImage = `url(${dataURL})`;
        target.style.backgroundSize = 'cover';
    }
}
// Star dictionary: [x%, y%, radius, type, blue_channel]
//define how many stars to display and their radius constraints
const starsNumber=100;
const minRadius=1, maxRadius=4;
const starsData ={}
for(let index =1;index<=starsNumber;index++){
    starsData[index]=[2+Math.floor(96*Math.random()),2+Math.floor(96*Math.random()),
        minRadius+Math.floor((maxRadius-minRadius)*Math.random()),Math.random()>0.5?"pulsar":"fixed",
        Math.floor(Math.random()*95+160)];
}
// Random offsets so pulsars aren't in sync
const starStates = Object.entries(starsData).map(([id, data]) => ({
    x: data[0], y: data[1], r: data[2], 
    isPulsar: data[3] === "pulsar", 
    blue: data[4],
    offset: Math.random() * Math.PI * 2 
}));
function skyResize() {
    skyCanvas.width = window.innerWidth;
    skyCanvas.height = window.innerHeight;
}
function skyDraw() {
    // 1. Clear the sky
    skyCTX.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
    const now = Date.now() / 500;
    starStates.forEach(star => {
        // Calculate position based on current window size (percentage)
        const px = (star.x / 100) * skyCanvas.width;
        const py = (star.y / 100) * skyCanvas.height;
        // Calculate opacity for pulsars
        let opacity = 1;
        if (star.isPulsar) {
            opacity = 0.3 + Math.abs(Math.sin(now + star.offset)) * 0.7;
        }
        // Draw the star
        skyCTX.beginPath();
        skyCTX.arc(px, py, star.r, 0, Math.PI * 2);
        skyCTX.fillStyle = `rgba(180, 180, ${star.blue}, ${opacity})`;
        // Add a little glow (The Canvas "Halo")
        skyCTX.shadowBlur = 10 * opacity;
        skyCTX.shadowColor = `rgb(180, 180, ${star.blue})`;
        skyCTX.fill();
    });
    requestAnimationFrame(skyDraw);
}

window.addEventListener('resize', skyResize);
skyResize();
skyDraw();


//Falling text, incoming stars animations
const draw_frame = document.getElementById("cv_intro_head");
draw_frame.style.backgroundColor = "transparent";
let cont = draw_frame.getContext("2d", { alpha: true });//retrieve the drawing 2d context
// full screen dimensions
const chr_list = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N',
        'O','P','Q','R','S','T','U','V','W','X','Y','Z','#','$','%','&'];
const chr_list_len=chr_list.length;
let chr_series =[]; const cols=(draw_frame.width)/8;//40;
const chr_size=Math.floor(draw_frame.width/cols); 
const col_w=Math.floor(draw_frame.width/cols);
function random_val(lim1,lim2,type){
    const rand=Math.min(lim1,lim2)+Math.random()*(Math.max(lim1,lim2)-Math.min(lim1,lim2));
    return type==="float"?rand:type==="int"?Math.floor(rand):null;
}
//we define a class that contains a function which draws a font (random) at the given coordinates
class Anim_place     {
    constructor(x, y, color) {this.x = x; this.y = y; this.nop=0; this.max_nop=6; this.color=color;}
    draw(cont)  {
        if(!this.nop){
            this.nop+=random_val(1,4,"int");
            //fills a char (randomly taken) at given style and size
            cont.fillStyle = this.color?this.color:"rgb(68, 170, 70)";
            cont.font = `bold ${chr_size}px serif`;
            cont.fillText(chr_list[random_val(0, chr_list_len - 1,"int")], this.x, this.y);
            this.y +=chr_size*0.8;
            if (this.y > draw_frame.height)this.y = random_val(-5, 0,"float");}
        else {this.nop+=random_val(1,4,"int");if(this.nop>this.max_nop)this.nop=0;}
                }
    }

// Function to render the intro "digital rain" animation on the header canvas
let introRefreshAnim;
function Intro_refresh()
{   const head_color=window.getComputedStyle(header).color;
    //if the chr_series vector is empty, we populate it with new class instances
    if(!chr_series.length){
        for(let ind_an = 0; ind_an < cols ; ind_an++){
            chr_series.push(new Anim_place(ind_an*col_w,
                random_val(-draw_frame.height,0,"float"),head_color));
        }
    }
    // fade previous frame to transparent so trails remain but background shows through
    cont.save();
    cont.globalCompositeOperation = 'destination-out';
    cont.fillStyle = 'rgba(0,0,0,0.06)'; // alpha controls trail length (smaller = longer trails)
    cont.fillRect(0,0,draw_frame.width,draw_frame.height);
    cont.restore();
    //calls the draw class function to draw a new char on each column
    for (let ind_an=0;ind_an<cols;ind_an++)chr_series[ind_an].draw(cont);
    //page 2 & 3 animation
    if([2,3].includes(nav_page) && gShake[nav_page]){
        // Skip frames on page 3 (52 elements) to maintain performance
        if(!window.__gFrameSkip) window.__gFrameSkip = 0;
        if(nav_page === 3 && ++window.__gFrameSkip % 2 !== 0) {
            introRefreshAnim=requestAnimationFrame(Intro_refresh);
            return;
        }
        
        // Generate 5 random values for this frame
        for(let i = 0; i < 5; i++){
            randVec[i] = (Math.random() - 0.5) * 0.05;
        }
        
        // Batch transform updates
        gShake[nav_page].forEach((elem, idx) => {
            // Cache angle on first access
            if(elem.__angle === undefined) {
                elem.__angle = Number(elem.getAttribute("data-ang"));
                elem.__tempVal = Number(elem.getAttribute("data-temp"));
                elem.style.transformOrigin = '256px 256px';
            }
            
            // Update temp value
            elem.__tempVal = Math.max(Math.min(elem.__tempVal + randVec[idx % 5], 1), 0);
            
            // Direct transform manipulation
            elem.style.transform = `rotate(${elem.__angle + (elem.__tempVal - 0.5) * 24}deg)`;
        });
    }

    introRefreshAnim=requestAnimationFrame(Intro_refresh);
};

function set_star_text(container) {
    // Clear existing letter divs first to avoid reading previously-generated letters
    const existing = container.querySelectorAll('.l_div');
    existing.forEach(el => el.remove());
    // Read the source text from the container's data attribute (fallback to textContent)
    let text = container.dataset.label || container.textContent || '';
    const L = measureElementWidth(container) || container.offsetWidth || 0;
    const R = L / 2;
    const charWidth = L * 0.24; 
    const stepAngleRad = 2 * Math.asin(charWidth / (2 * R));
    const totalLetters = text.length;
    // To read Left-to-Right:
    // We start at (Bottom Center + half of the total arc) 
    // and subtract the angle for each subsequent letter.
    const totalArcAngle = stepAngleRad * (totalLetters - 1);
    const startAngle = (Math.PI / 2) + (totalArcAngle / 2);
    for (let i = 0; i < totalLetters; i++) {
        const l_div = document.createElement('div');
        l_div.id = `l_div_${i + 1}`;
        l_div.className = 'l_div';
        l_div.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        l_div.style.position = 'absolute';
        l_div.style.width = `${charWidth}px`;
        l_div.style.height = `${charWidth}px`;
        l_div.style.fontSize = `${charWidth * 0.8}px`;
        l_div.style.display = 'flex';
        l_div.style.alignItems = 'center';
        l_div.style.justifyContent = 'center';
        // Subtracting i * stepAngleRad moves us clockwise (Left to Right)
        const currentAngle = startAngle - (i * stepAngleRad);
        const x = R + R * Math.cos(currentAngle) - (charWidth / 2);
        const y = R + R * Math.sin(currentAngle) - (charWidth / 2);
        // Rotation: Points the bottom of the letter away from the center
        const rotationDeg = (currentAngle - Math.PI / 2) * (180 / Math.PI);
        l_div.style.left = `${x}px`;
        l_div.style.top = `${y}px`;
        l_div.style.transform = `rotate(${rotationDeg}deg)`;
        container.appendChild(l_div);
    }
}

// Measure an element's width even when it may be hidden: try computed style, offsetWidth,
// and as a last resort create an off-screen clone to force layout and measure.
function measureElementWidth(el) {
    try {
        const cs = window.getComputedStyle(el);
        const w = parseFloat(cs.width);
        if (w && w > 0) return w;
    } catch (e) {
        // ignore
    }
    if (el.offsetWidth && el.offsetWidth > 0) return el.offsetWidth;
    // Off-screen clone fallback
    const clone = el.cloneNode(true);
    clone.style.position = 'absolute';
    clone.style.visibility = 'hidden';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    clone.style.display = 'block';
    clone.style.width = 'auto';
    document.body.appendChild(clone);
    const measured = clone.offsetWidth || parseFloat(window.getComputedStyle(clone).width) || 0;
    clone.remove();
    return measured;
}


function set_text(resize=null){
    Object.keys(text_data).forEach(function(key) {
        let html_elem;
        let used_lang = "";
        let used_text = "";
        if(!document.getElementById(key)){
            return;}
        else {
            //if selected language does not have appropriate text, fallback to english
            used_lang = (lang in text_data[key])?lang:lang_fall;
            used_text = ("stat" in text_data[key])?
                text_data[key][used_lang][text_data[key]["stat"]]:text_data[key][used_lang] +
                ("add_text" in text_data[key]?text_data[key]["add_text"]:"");
            html_elem = document.getElementById(key);
            // store original label in data attribute to avoid reading generated DOM
            if ("label" in html_elem.dataset) html_elem.dataset.label = used_text;
            // keep visible text as well (styling may hide it), but generation will use data-label
            else html_elem.innerHTML = used_text;
            if (key.startsWith("text_s_")||key.startsWith("text_ls_")) set_star_text(html_elem);
        }});
    let counter=1;
    pageTitles=[];
    while(counter){
        let titleElem=document.getElementById(`star_${counter}`);
        if(titleElem){
            const imgHtml = titleElem.querySelector("img, svg").outerHTML;
            pageTitles[counter-1] = `${imgHtml} ${text_data["text_s_"+(counter)][lang]} ${imgHtml}`;
            counter++;
        }
        else counter=0;
    }
        if(!resize)generateContent(lang);
    // After the text has been populated we can update the ticker duration if
    // we're on the home page.  This covers the initial load as well as any
    // language changes that affect the message length.
    if (nav_page === 0) {
        const ticker = document.querySelector('.sm_content');
        if (ticker) updateTicker(ticker.innerText);
    }
}

//Language change procedure
function change_language(language){
    const l_parent = language.parentNode;
    let l_children = Array.from(l_parent.children)
    let l_index = l_children.indexOf(language);
    if (!l_index) return // first element is the already selected language
    else {
        lang = language.dataset.lang;
        l_parent.insertBefore(language,l_parent.firstChild);
        set_text();
        clickToImage();
    }
}

//Theme change procedure
function change_theme(newTheme){
    const t_parent = newTheme.parentNode;
    let t_children = Array.from(t_parent.children)
    let t_index = t_children.indexOf(newTheme);
    let pastTheme = theme;
    if (!t_index) return // first element is the already selected theme
    else {
        //do the theme change to all DOM elements
        theme = (newTheme.id).replace("theme_","");
        t_parent.insertBefore(newTheme,t_parent.firstChild);
        //do the theme change to all DOM elements
        (document.querySelectorAll(`.theme_${pastTheme}`)).forEach(el=>{
            el.classList.remove(`theme_${pastTheme}`);
            el.classList.add(`theme_${theme}`);
        })
    }
    //for elements that use solely color or background props, we update them as well
    const thColorItems=document.querySelectorAll("[class^='th_color_']");
    const thBckgItems=document.querySelectorAll("[class^='th_bckg_']");
    if(thColorItems){
        thColorItems.forEach(elem =>{
            for(var ind=1;ind<6;ind++){
                if(elem.classList.contains(`th_color_${ind}`)){
                    elem.classList.remove(`th_color_${ind}`);}
            }
            elem.classList.add(`th_color_${theme}`);
        });
    }
    if(thBckgItems){
        thBckgItems.forEach(elem =>{
            for(var ind=1;ind<6;ind++){
                if(elem.classList.contains(`th_bckg_${ind}`)){
                    elem.classList.remove(`th_bckg_${ind}`);}
            }
            elem.classList.add(`th_bckg_${theme}`);
        });
    }
    //Refresh the Matrix style animation with the new color
    cancelAnimationFrame(introRefreshAnim);
    chr_series =[];
    cont.clearRect(0, 0, draw_frame.width, draw_frame.height);
    Intro_refresh();
}

//set close and download buttons for image window
const imageOverlay = document.getElementById("image-overlay");
const downImgBut = document.getElementById("down-img-but");
const closeImgBut = document.getElementById("close-img-but");
//Adding listeners and page setup based on download event
document.addEventListener("DOMContentLoaded", () => {
    applyDynamicBackground();
    set_text();
    //Assign click listeners to settings elements
    const flag_elem = document.getElementById("flag");
    (flag_elem.childNodes).forEach(elem => {
        elem.addEventListener('click', (e) => {
                change_language(elem);
            })
    });
    const theme_elem = document.getElementById("theme");
    (theme_elem.childNodes).forEach(elem => {
        elem.addEventListener('click', (e) => {
                change_theme(elem);
            })
    });
    downImgBut.addEventListener('click', () => {
        downloadImage();
        })
    closeImgBut.addEventListener('click', (elem) => {
        var imgBox = document.getElementById("img-box");
        var imageOverlay = document.getElementById("image-overlay");
        imgBox.children[0].remove();
        imageOverlay.style.display="none";
        });
    clickToImage();
    (document.getElementById("log_el")).addEventListener("click", showLoginDialog);
    const triggerDivs = [document.querySelector('#flag'), document.querySelector('#theme')];
    const targetDivs = [
    document.querySelector('#flag'), 
    document.querySelector('#theme'),
    document.querySelector('#login')
    ];
    const addTargetDiv = document.querySelector('#log_stat');
    triggerDivs.forEach(trigger => {
    // Hide others
    trigger.addEventListener('mouseenter', () => {
        targetDivs.forEach(target => {
        if (target !== trigger) {
            target.style.display = 'none';
        }
        addTargetDiv.style.display = 'none';
        });
    });
    // Show all again
    trigger.addEventListener('mouseleave', () => {
        targetDivs.forEach(target => {
        target.style.display = ''; // Reverts to the original CSS value (empty string)
        });
        addTargetDiv.style.display = '';
    });
    });
    //Set history
    //Get the page from the URL hash
    const hash = window.location.hash.replace('#', '');
    const nr = nameToNr[hash] !== undefined ? nameToNr[hash] : 0;
    // Initialize with replaceState and the hash URL (prevents back button on initial load)
    history.replaceState({ page: nr }, "", nr > 0 ? '#' + pageMap[nr] : '#home');
    // Update page visibility and header directly (replicate key parts of page_select)
    if (nr === 0) {
        // Home page is default, just ensure visibility is correct
        nav_page = 0;
        for(let ind=0; ind<7; ind++) {
            let req_page = document.getElementById("content_" + ind);
            if (ind === 0) {
                req_page.classList.remove("unseen"); req_page.classList.add("seen");
            } else {
                req_page.classList.remove("seen"); req_page.classList.add("unseen");
            }
        }
    } else {
        // Non-home page: show the correct page, skip history push since we already did replaceState
        page_select(nr, true);
    }
});


function clickToImage(){
    const imageCollection=document.querySelectorAll(
        "img[data-stat^='d0_a1'], img[data-stat^='d1_a1']");
    imageCollection.forEach(elem =>{
        //add click event to each such image
        elem.addEventListener('click', (e) => {
            var imgStatus = (elem.getAttribute('data-stat')).split("_");
            var imgBox = document.getElementById("img-box");
            var imgBoxA = document.getElementById("img-box-a");
            if (!(imgStatus[1]==="a1")){console.log(imgStatus[1],""); return;}
            if (imgStatus[0]==="d1"){downImgBut.style.display="block";}
            else downImgBut.style.display="none";
            imageOverlay.style.display="flex";
            var newImg = document.createElement("img");
            imgBoxA.href = newImg.src = elem.src;
            imgBoxA.title = newImg.alt = elem.alt;
            imgBox.prepend(newImg);
        });
    });
    setCursorImg(imageCollection);
}

//Set popstate event listener
window.addEventListener('popstate', (event) => {
    // When back button is clicked, the browser already changed the history state.
    // We just need to update the UI, not add to history again.
    page_select((event.state && event.state.page !== undefined) ? event.state.page : 0, true);
});




//A function that downloads the image (if permitted)
function downloadImage(){
    var imgBoxA = document.getElementById("img-box-a");
    imgBoxA.click();
    alert("The wanted image is now in your ... you know what.")
}

async function unlockGallery(mapping) {
    for (let pair of mapping) {
        const imgA = document.getElementById(pair.sideA_Id);
        const imgB = document.getElementById(pair.sideB_Id);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imgA.naturalWidth;
        canvas.height = imgA.naturalHeight;
        // Process XOR
        ctx.drawImage(imgA, 0, 0);
        const dataA = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgB, 0, 0);
        const dataB = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const viewA = new Uint32Array(dataA.data.buffer);
        const viewB = new Uint32Array(dataB.data.buffer);
        for (let i = 0; i < viewA.length; i++) {
            viewA[i] = viewA[i] ^ viewB[i];
            dataA.data[i * 4 + 3] = 255; // Keep opaque
        }
        ctx.putImageData(dataA, 0, 0);
        // Update the original <img> element so it shows the clear image
        // This also makes the image downloadable in its decrypted state
        imgA.src = canvas.toDataURL('image/png');
        // Clean up hidden Side B image to save memory
        imgB.remove(); 
    }
}

async function triggerCustomSave(imgId, filename) {
    const img = document.getElementById(imgId);
    // Convert the current src (Data URL) to a Blob
    const response = await fetch(img.src);
    const blob = await response.blob();
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{ description: 'PNG Image', accept: {'image/png': ['.png']} }]
            });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
        } catch (e) {
            if (e.name !== 'AbortError') saveFallback(blob, filename);
        }
    } else {
        saveFallback(blob, filename);
    }
}
//if no save_as picker exists / accessible, then fallback to link download
function saveFallback(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    alert("No system save dialog. Saved to default Downloads folder.");
}


function showLoginDialog() {
    // 1. Create Overlay
    const overlay = document.createElement('div');
    overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center; z-index:9999;";
    // 2. Create Modal Form
    const modal = document.createElement('div');
    modal.style = "background:#222; padding:30px; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.5); width:320px; color:white; font-family:sans-serif;";
    modal.innerHTML = `
        <h2 style="margin-top:0">${text_data["secure_login"][lang]}</h2>
        <input type="text" id="username" placeholder="${text_data["username"][lang]}" style="width:100%; padding:10px; margin:10px 0; border:none; border-radius:5px;">
        <input type="password" id="password" placeholder="${text_data["password"][lang]}" style="width:100%; padding:10px; margin:10px 0; border:none; border-radius:5px;">
        <button id="btnSubmit" style="width:100%; padding:12px; background:#007bff; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">${text_data["authenticate"][lang]}</button>
        <button id="btnCancel" style="width:100%; margin-top:10px; background:transparent; color:#888; border:none; cursor:pointer;">${text_data["cancel"][lang]}</button>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    // 3. Handle Submit
    document.getElementById('btnSubmit').onclick = async () => {
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        try {
            // Secure POST request using fetch
            const response = await fetch('https://side-b-server.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, pass })
            });
            //if successful, expecting { token: "...", sideB_Images: [...] }
            //else, number of left login available attempts
            const data = await response.json(); // 
            if (response.ok) {                
                // Store token for session persistence
                sessionStorage.setItem('auth_token', data.token);
                // Close dialog and start your gallery decryption
                document.body.removeChild(overlay);
                unlockGallery(data.sideB_Images); 
            } else {
                alert("Authentication Failed." + (data.attempts_left !== undefined)?
                ((data.attempts_left=="0")?"Locked account (too many failed login attempts).":
                `Attempts left: ${data.attempts_left}.`):"Incorrect credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Feature currently not yet implemented. Sorry for this inconvenience.");
            document.getElementById('btnCancel').click();
        }
    };
    document.getElementById('btnCancel').onclick = () => document.body.removeChild(overlay);
}

//Set the cursor type when hovering over images (acc to credentials)
function setCursorImg(imageCollection) {
    imageCollection.forEach(elem => {
        //console.log("issue item is: ", elem.id);
    var imgStatus = (elem.getAttribute('data-stat')).split("_");
    if(!(imgStatus[1]==="a1")){elem.style.cursor="default";}
    else elem.style.cursor="zoom-in";
    })
}

//🎦🎦🎦 BODY ANIMATION SECTION 🎦🎦🎦
const cvb_1 = document.getElementById("cv_intro_body1");
const ctb_1 = cvb_1.getContext('2d');
const cvb_2 = document.getElementById("cv_intro_body2");
const i_cont = document.getElementById("content_0");
//viewport minimum sizes       
const fps = 60; // Set a higher FPS for smoother animation
//Segments part
const nr_seg = 256;
let seg_speed = 4;        
const pc = new Array(nr_seg);
let vp_w=i_cont.clientWidth, vp_h=i_cont.clientHeight;
let center_x=parseInt(vp_w/2), center_y=parseInt(vp_h/2);
let z_anim = (vp_w + vp_h) / 2;

function anim_setup() {
    for (let i = 0; i < nr_seg; i++) {
        pc[i] = [
            Math.random() * vp_w * 2 - vp_w,
            Math.random() * vp_h * 2 - vp_h,
            // Distribute particles evenly through z-space instead of randomly
            (i / nr_seg) * z_anim + z_anim / 10,
            0, 0];
        // Pre-calculate initial screen positions to avoid drawing from 0,0 on first frame
        const scale_factor = z_anim / ((vp_w + vp_h) / 2);
        pc[i][3] = center_x + (pc[i][0] / pc[i][2]) * 256 * scale_factor;
        pc[i][4] = center_y + (pc[i][1] / pc[i][2]) * 256 * scale_factor;
    }
}
function inside_limits(test_val, lim1, lim2) {
    return test_val >= lim1 && test_val <= lim2;
}
function anim() {
    //canvas animation
    if (!is_resizing) {
        ctb_1.clearRect(0, 0, vp_w, vp_h); // Clear the canvas
    for (let i = 0; i < nr_seg; i++) {
        let go_draw = true;
        let pc_move_x = pc[i][3];
        let pc_move_y = pc[i][4];
        pc[i][2] -= seg_speed;
        if (pc[i][2] < 0) {
            pc[i][2] = z_anim;
            go_draw = false;
        }
        const scale_factor = z_anim / ((vp_w + vp_h) / 2);
        pc[i][3] = center_x + (pc[i][0] / pc[i][2]) * 256 * scale_factor; // Scales with viewport
        pc[i][4] = center_y + (pc[i][1] / pc[i][2]) * 256 * scale_factor; // Scales with viewport
        if (inside_limits(pc_move_x, 0, vp_w) && inside_limits(pc_move_y, 0, vp_h) && go_draw) {
            // Scale segment width based on depth (closer = wider)
            const depth_ratio = pc[i][2] / z_anim;
            const segment_width = Math.max(2, (1 - depth_ratio) * 12);
            // Draw parallelogram instead of line
            const dx = pc[i][3] - pc_move_x;
            const dy = pc[i][4] - pc_move_y;
            const length = Math.sqrt(dx * dx + dy * dy);
            if (length > 0) {
                // Perpendicular offset for parallelogram width
                const perp_x = (-dy / length) * (segment_width / 2);
                const perp_y = (dx / length) * (segment_width / 2);
                
                ctb_1.fillStyle = 'rgba(205,215,205,' + (1 - depth_ratio * 0.5) + ')';
                ctb_1.beginPath();
                ctb_1.moveTo(pc_move_x + perp_x, pc_move_y + perp_y);
                ctb_1.lineTo(pc[i][3] + perp_x, pc[i][4] + perp_y);
                ctb_1.lineTo(pc[i][3] - perp_x, pc[i][4] - perp_y);
                ctb_1.lineTo(pc_move_x - perp_x, pc_move_y - perp_y);
                ctb_1.fill();
            }
        }
    }
    }
    //animation call loop
    setTimeout(anim, 1000 / fps);
}


let resizeTimeout = null;
let is_resizing = false;
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        const width = entry.target.clientWidth;
        const height = entry.target.clientHeight;
        if (Math.abs(width - vp_w) > 5 || Math.abs(height - vp_h) > 5) {
            is_resizing = true;
            clearTimeout(resizeTimeout);
            // Update viewport and 2D canvas
            vp_w = width;
            vp_h = height;
            center_x = (width / 2) | 0;
            center_y = (height / 2) | 0;
            z_anim = (vp_w + vp_h) / 2;
            cvb_1.width = width;
            cvb_1.height = height;
            resizeTimeout = setTimeout(() => {
                anim_setup();
                is_resizing = false;
            }, 250);
        }
    }
});

// Initialize canvas dimensions on load (ResizeObserver doesn't always fire initially)
const initWidth = i_cont.clientWidth;
const initHeight = i_cont.clientHeight;
cvb_1.width = initWidth;
cvb_1.height = initHeight;
center_x = (initWidth / 2) | 0;
center_y = (initHeight / 2) | 0;
vp_w = initWidth;
vp_h = initHeight;
z_anim = (vp_w + vp_h) / 2;

////////////////////////////////////////////////////////////////
////////////////////// Animated Rays logic /////////////////////
let rayCV; // reserved for the canvas element used to draw the rays
let rayCTX; // reserved for the 2d context
// Ray Dimensions (Min and Max)
let baseMin, baseMax, heightMin, heightMax;// 5,15,20,50
// Sun properties
let sunRadius;// = 64; // Half of 128px
let centerX=0;
let centerY=0;
// Animation Speed (how fast a ray grows/shrinks)
const rayLifeSpeed = 0.02; // Similar to original 't' speed
// Minimum difference in radians (30 degrees)
const minDiff = 30 * (Math.PI / 180);
// Spawning Timer Configuration
// Assuming 60fps (~16.6ms per frame).
// 200ms ~= 12 frames, 500ms ~= 30 frames.
const minSpawnFrames = 8;//12
const maxSpawnFrames =20;//30
let rays=[]; // Current rays
let rayReq; // Store the animation request in order to cancel it later
let spawnCounter = 0; // Store the number of frames till next ray creation
let lastRayAngle = 0; // To track the angle of the previous ray
// Ray class
class Ray {
    constructor(angle) {
        this.angle = angle; // Angle in radians
        this.life = 0;       // 0 to 2. (0->1 is grow, 1->2 is shrink)
        this.dead = false;  // Flag for removal
    }
    update() {
        this.life += rayLifeSpeed;
        // If life exceeds 2 (full cycle done), mark for removal
        if (this.life > 2) {
            this.dead = true;}
    }
    draw(rayCTX) {
        // Calculate 't' (0 to 1) for size interpolation.
        // Phase 1 (Growing): life goes 0 -> 1. t = life.
        // Phase 2 (Shrinking): life goes 1 -> 2. t = 2 - life.
        let t = (this.life <= 1) ? this.life : 2 - this.life;
        // Interpolate size
        const base = baseMin + (baseMax - baseMin) * t;
        const height = heightMin + (heightMax - heightMin) * t;
        const halfBase = base / 2;
        rayCTX.save(); // Save current context state
        // 1. Move origin to the center of the canvas (Sun center)
        rayCTX.translate(centerX, centerY);
        // 2. Rotate to the specific angle of this ray
        rayCTX.rotate(this.angle);
        // 3. Move origin to the edge of the sun (where the base of the ray sits)
        // Since we rotated, moving -64 on Y axis puts us at the top edge of the sun relative to rotation
        rayCTX.translate(0, -sunRadius);
        // Draw the triangle
        // Coordinates are now relative to the base center on the sun's edge
        // Tip points "outward" (away from center), which is negative Y in this local space
        rayCTX.beginPath();
        rayCTX.moveTo(0, -height);
        rayCTX.lineTo(-halfBase, 0);
        rayCTX.lineTo(halfBase, 0);
        rayCTX.closePath();
        // Create gradient relative to the triangle shape
        // Horizontal gradient from left edge to right edge
        const gradient = rayCTX.createLinearGradient(-halfBase, 0, halfBase, 0);
        gradient.addColorStop(0.0, 'rgba(255,255,255,0)');
        gradient.addColorStop(0.3, 'rgba(255,255,150,0.2)');
        gradient.addColorStop(0.5, 'rgba(255,255,100,1)');
        gradient.addColorStop(0.7, 'rgba(255,255,150,0.2)');
        gradient.addColorStop(1.0, 'rgba(255,255,255,0)');
        rayCTX.fillStyle = gradient;
        rayCTX.fill();
        rayCTX.restore(); // Restore context for next ray
    }
}

/* Create a new ray with valid angle constraints */
function spawnRay() {
    // Random additional angle (up to full circle - minDiff)
    const randomAdd = minDiff + Math.random() * ((2 * Math.PI) - minDiff);
    // Calculate new angle
    let newAngle = lastRayAngle + randomAdd;
    // Normalize angle to 0 - 2PI range
    if (newAngle > 2 * Math.PI) {
        newAngle -= 2 * Math.PI;
    }
    lastRayAngle = newAngle;
    // Add to array
    rays.push(new Ray(newAngle));
    // Reset counter with random value between limits
    spawnCounter = Math.floor(Math.random() * (maxSpawnFrames - minSpawnFrames + 1)) + minSpawnFrames;
}
function animateRays() {
    //if(!rayCTX)return;
    // Clear the canvas
    rayCTX.clearRect(0, 0, rayCV.width, rayCV.height);
    // 1. Handle Spawning Logic
    spawnCounter--;
    if (spawnCounter <= 0) {
        spawnRay();
    }
    // 2. Update and Draw Rays
    // Loop backwards to safely remove dead rays from the array
    for (let i = rays.length - 1; i >= 0; i--) {
        const ray = rays[i];
        ray.update();
        if (ray.dead) {
            rays.splice(i, 1); // Remove from screen
        }
        else { ray.draw(rayCTX); }
    }
    rayReq = requestAnimationFrame(animateRays);
}

function raysGen(sun){
    // If a canvas was already created for this sun, do nothing (idempotent)
    if (sun.querySelector('canvas')) {
        return;
    }
    const baseWidth=sun.clientWidth;
    rayCV = document.createElement("canvas");
    rayCTX = rayCV.getContext("2d");
    sun.append(rayCV);
    let modRay = baseWidth/128
    baseMin = Math.floor(5*modRay);
    baseMax = Math.floor(15*modRay);
    heightMin = Math.floor(20*modRay);
    heightMax = Math.floor(50*modRay);
    sunRadius = Math.floor(baseWidth / 2);
    // Initialize with a random counter so it doesn't spawn immediately on frame 1
    spawnCounter = Math.floor(Math.random() * (maxSpawnFrames - minSpawnFrames + 1)) + minSpawnFrames;
    rayCV.width = rayCV.clientWidth;
    rayCV.height = rayCV.clientHeight;
    centerX = rayCV.width / 2;
    centerY = rayCV.height / 2;
    animateRays();    
}
function raysKill(sun){
    cancelAnimationFrame(rayReq);
    sun.querySelectorAll('canvas').forEach(CVElement => CVElement.remove()); 
}

const h_intro = new Array(document.getElementById("scroll_mess"),
    document.getElementById("h_pict"),document.getElementById("title-msg"),
    document.getElementById("settings"));
const h_non_intro = new Array(document.getElementById("little_stars"),
    document.getElementById("logged_in_as"), document.getElementById("page_title"));
function page_select(page, skipHistory = false){
    if (isNaN(page)) {
        return;}//no request processed if the page argument is invalid
    let previousPage = nav_page;
    nav_page=page;
    //process body content first
    for(let ind=0;ind<7;ind++){
        let req_page=document.getElementById("content_"+ind);
        if (ind==nav_page){
            req_page.classList.remove("unseen");req_page.classList.add("seen");}
        else {req_page.classList.remove("seen");req_page.classList.add("unseen");}
    }
    //process header content second
    if (nav_page!=0){
        h_intro.forEach(elem => {
            elem.classList.remove("seen"); elem.classList.add("unseen");
        })
        h_non_intro.forEach(elem => {
            elem.classList.remove("unseen"); elem.classList.add("seen");
        })
        for(let ind=0;ind<7;ind++){
            let item = document.getElementById("l_star_"+ind);
            if (ind == nav_page)item.style.display="none";
            else item.style.display="inline-block";
        }
        // Recompute letter positions for the little stars now that they are visible
        for (let i = 0; i <= 6; i++) {
            const txt = document.getElementById('text_ls_' + i);
            if (txt) set_star_text(txt);
        }
        (document.getElementById("page_title_txt")).innerHTML = pageTitles[nav_page-1];
        // Recheck heights of cx_box elements now that the page is visible
        requestAnimationFrame(() => checkTallDivs());
    }
    else {
        h_intro.forEach(elem => {
            elem.classList.remove("unseen"); elem.classList.add("seen");
        })
        h_non_intro.forEach(elem => {
            elem.classList.remove("seen"); elem.classList.add("unseen");
        })
        // When returning to intro, recompute intro star texts (they may need layout update)
        for (let i = 1; i <= 6; i++) {
            const txt = document.getElementById('text_s_' + i);
            if (txt) set_star_text(txt);
        }
        // ensure the ticker duration is recalculated now that the element is visible
        requestAnimationFrame(() => {
            const ticker = document.querySelector('.sm_content');
            if (ticker) updateTicker(ticker.innerText);
        });
    }
    // If switching back to content_0 (home page), reinitialize WebGL viewport and force render
    if (nav_page === 0 && previousPage !== 0) {
        // Wait for DOM layout to update before reinitializing
        setTimeout(() => {
            initViewport();
            // Force an immediate render to restore the frame
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        }, 50);
    }
    // Push the new page in history with hash URL
    // Only push if not skipping history (i.e., not during initialization or popstate)
    if (!skipHistory) {
        history.pushState({ page: nav_page }, "", '#' + pageMap[nav_page]);
    }

}
let starCollection = [];
for (let i = 1; i <= 6; i++){
    starCollection.push(document.getElementById(`star_${i}`));
}
for (let i = 0; i <= 6; i++){
    starCollection.push(document.getElementById(`l_star_${i}`));
}

for (let i = 0; i < starCollection.length; i++) {
    const star = starCollection[i];
    if (star) {
        star.addEventListener('mouseover', () => {
            raysGen(star); });
        star.addEventListener('mouseleave', () => {
            raysKill(star); });
        star.addEventListener('click', () => {
            //console.log('event: click', star.id);
            //pass only the number included in the id string as argument
            page_select(Number(((star.id).split("_"))[((star.id).split("_")).length-1]));

        })
        // If the pointer is already over the element (page reload while cursor sits on it),
        // some browsers may not reflect :hover immediately. Defer the check slightly
        // so the browser has time to apply hover state after painting.
        setTimeout(() => {
            const hovered = star.matches(':hover');
            // Fallback: check computed background to detect CSS hover effect
            let cssHover = false;
            try {
                const bg = window.getComputedStyle(star).backgroundImage || "";
                cssHover = bg.includes('radial-gradient') || bg.includes('linear-gradient');
            } catch (e) { /* ignore */ }
            if (hovered || cssHover) raysGen(star);
        }, 120);
    }
}


// Start observing container; WebGL sizing will be handled after renderer is created
resizeObserver.observe(i_cont);
////////////////////////////////////////////////////////////
/////////////// WEBGL (GLB models) animation ///////////////
////////////////////////////////////////////////////////////

const loadingOverlay = document.getElementById("loading-overlay");
const loadingText = document.getElementById("loading-text");
// Track when GLB assets are loaded
let glbTotalToLoad = 3;   // shuttle, quarter, flame
let glbLoadedCount = 0;
let animationsStarted = false;

function startAllAnimationsOnce() {
    if (animationsStarted) return;
    animationsStarted = true;
    // Header intro animation
    Intro_refresh();
    // 2D starfield
    anim_setup();
    anim();
    // WebGL animation loop
    animate();
}

function markGlbLoaded() {
    glbLoadedCount++;
    if (glbLoadedCount >= glbTotalToLoad && loadingOverlay) {
        // Hide loading overlay immediately
        loadingOverlay.classList.add("hidden");
        contents.style.pointerEvents="auto";
        header.style.pointerEvents="auto";
        // Now start all JS-driven animations
        startAllAnimationsOnce();
    }
}

// add new three.js scene
const scene = new THREE.Scene();
// Size = 2 means arrows go from -2 to +2 units (roughly)
// add camera @ given position and angle
const camera = new THREE.PerspectiveCamera(75, vp_w / vp_h, 0.1, 1000);
let mouseX = vp_w / 2;
let mouseY = vp_h / 2;
 // add 3d objects
let object;
let orbitGroup = null;       // group that will hold the orbiting quarters
let quarter1 = null;
let quarter2 = null;
let orbitSpeed = 0.01;       // radians per frame (tweak as you like)
 // Flames
let flameBase = null;        // original flame mesh from flame.glb
let flames = [];
// Helper: apply current BLUE→RED gradient to a mesh's geometry along its main axis
function updateFlameVertexColors(mesh) {
    if (!mesh.isMesh) return;
    const geom = mesh.geometry;
    if (!(geom && geom.isBufferGeometry)) return;
    const posAttr = geom.getAttribute("position");
    if (!posAttr) return;
    const vertexCount = posAttr.count;
    // Compute extents along X, Y, Z
    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    let zMin = Infinity, zMax = -Infinity;
    for (let i = 0; i < vertexCount; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = posAttr.getZ(i);
        if (x < xMin) xMin = x;
        if (x > xMax) xMax = x;
        if (y < yMin) yMin = y;
        if (y > yMax) yMax = y;
        if (z < zMin) zMin = z;
        if (z > zMax) zMax = z;
    }
    const dx = xMax - xMin;
    const dy = yMax - yMin;
    const dz = zMax - zMin;
    // Decide main axis: largest span
    let axis = "x";
    if (dy >= dx && dy >= dz) axis = "y";
    else if (dz >= dx && dz >= dy) axis = "z";
    // randoms per frame (for this mesh) so gradient changes over time
    const rnd1 = Math.random(); // 0..1
    const rnd2 = Math.random(); // 0..1
    // Light_RED  = (rnd1,rnd1,rnd1) + (rnd2*30+200,0,0)
    // Light_BLUE = (rnd1,rnd1,rnd1) + (0,0,rnd2*30+200)
    const baseGrey = rnd1; // 0..1
    const extra    = (rnd2 * 30 + 200) / 255.0; // ~0.78..0.9
    const redColor  = new THREE.Color(
        THREE.MathUtils.clamp(baseGrey + extra, 0, 1),
        THREE.MathUtils.clamp(baseGrey,         0, 1),
        THREE.MathUtils.clamp(baseGrey,         0, 1)
    );
    const blueColor = new THREE.Color(
        THREE.MathUtils.clamp(baseGrey,         0, 1),
        THREE.MathUtils.clamp(baseGrey,         0, 1),
        THREE.MathUtils.clamp(baseGrey + extra, 0, 1)
    );
    let colorAttr = geom.getAttribute("color");
    if (!colorAttr || colorAttr.count !== vertexCount) {
        colorAttr = new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3);
        geom.setAttribute("color", colorAttr);
    }
    const colors = colorAttr.array;
    for (let i = 0; i < vertexCount; i++) {
        let t;
        if (axis === "x") {
            const x = posAttr.getX(i);
            t = (x - xMin) / (dx || 1);
        } else if (axis === "y") {
            const y = posAttr.getY(i);
            t = (y - yMin) / (dy || 1);
        } else { // "z"
            const z = posAttr.getZ(i);
            t = (z - zMin) / (dz || 1);
        }
        // If blue/red are swapped relative to nozzle/tip, change t -> 1 - t
        const color = blueColor.clone().lerp(redColor, t);
        colors[i * 3 + 0] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    colorAttr.needsUpdate = true;
}
let controls;
//object to render
let objToRender = "shuttle";
let isLeftMousePressed = false; // Track if left mouse button is pressed
let dragStartX = 0, dragStartY = 0; // Track where drag started
let dragDeltaX = 0, dragDeltaY = 0; // Track mouse movement during drag
let prevDragDeltaX = 0, prevDragDeltaY = 0; // Track previous frame's delta
let accumulatedRotationX = 0, accumulatedRotationY = 0; // Track accumulated rotation
//new loader instance
const loader = new GLTFLoader();
//load the file, path pointing directly to the .glb file
loader.load(
    `./static/models/${objToRender}.glb`, 
    function (gltf) {
        // Get the model
        object = gltf.scene;
        // Calculate bounding box to properly center and scale the model
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        // Center the model at origin
        object.position.sub(center);
        // Calculate appropriate camera distance based on model size
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.5; // Give some extra space
        camera.position.z = cameraZ;
        camera.far = cameraZ * 10;
        camera.updateProjectionMatrix();
        // Log for debugging
        // Capture initial rotation from loaded model
        accumulatedRotationX = object.rotation.x;
        accumulatedRotationY = object.rotation.y;
        // Add shuttle to scene
        scene.add(object);
        // Count this asset as loaded
        markGlbLoaded();
        // Create orbiting "quarter" objects
        orbitGroup = new THREE.Group();
        // Load the quarter model once, then clone it
        const quarterLoader = new GLTFLoader();
        quarterLoader.load(
            `./static/models/quarter.glb`,
            function (qgltf) {
                const quarterBase = qgltf.scene;
                // Center the quarter model around its own origin
                const qBox = new THREE.Box3().setFromObject(quarterBase);
                const qCenter = qBox.getCenter(new THREE.Vector3());
                quarterBase.position.sub(qCenter);
                // Clone the quarter for both orbiting objects
                quarter1 = quarterBase.clone(true);
                quarter2 = quarterBase.clone(true);
                // Place them along the shuttle's local X axis
                // tweak these distances to taste
                const dist1 = -0.325;  // units along +X
                const dist2 = -0.205; // units along -X
                quarter1.position.set(dist1, 0, 0);
                quarter2.position.set(dist2, 0, 0);
                // Add quarters into the orbit group
                orbitGroup.add(quarter1);
                orbitGroup.add(quarter2);
                // Place the orbit group at the shuttle center (origin in shuttle space)
                orbitGroup.position.set(0, 0, 0);
        // Parent the orbit group to the shuttle object
        object.add(orbitGroup);
        markGlbLoaded();
        // Load flame model and attach 5 clones
        const flameLoader = new GLTFLoader();
        flameLoader.load(
            `./static/models/flame.glb`,
            function (fgltf) {
                flameBase = fgltf.scene;
                // Ensure flameBase uses BufferGeometry so we can update vertex colors later
                flameBase.traverse((child) => {
                    if (!child.isMesh) return;
                    if (!(child.geometry && child.geometry.isBufferGeometry)) {
                        child.geometry = new THREE.BufferGeometry().fromGeometry(child.geometry);
                    }
                });
                // Find nozzle positions in shuttle space.
                const x_noz = 0.65, y_noz = 0.048, z_noz = 0.087;
                const nozzlePositions = [
                    // Adjust these after inspecting your model; here all flames point along -X
                    new THREE.Vector3(x_noz,  0.00,  0.00),
                    new THREE.Vector3(x_noz,  y_noz,  z_noz),
                    new THREE.Vector3(x_noz,  y_noz, -z_noz),
                    new THREE.Vector3(x_noz, -y_noz,  z_noz),
                    new THREE.Vector3(x_noz, -y_noz, -z_noz)
                ];
                // Clear previous flames if any
                flames.forEach(f => object.remove(f));
                flames = [];
                nozzlePositions.forEach((pos, index) => {
                    const flame = flameBase.clone(true);
                    // Ensure each mesh has its own material instance
                    flame.traverse((child) => {
                        if (child.isMesh) {
                            // Replace whatever material came from the glb
                            child.material = new THREE.MeshBasicMaterial({
                                vertexColors: true,
                                side: THREE.DoubleSide
                            });
                        }
                    });
                    flame.position.copy(pos);
                    // Assume nozzle direction is -Z; flame points along -Z
                    flame.rotation.set(0, 0, 0);
                    // Per-flame animation parameters
                    flame.userData.phase = Math.random() * Math.PI * 2;
                    flame.userData.intensity = 1.0;
                    object.add(flame);
                    flames.push(flame);
                });
                markGlbLoaded();
            },
            function (xhr) {
                console.log('flame.glb ' + (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('Error loading flame.glb:', error);
                markGlbLoaded();
            }
        );
    },
            function (xhr) {
                console.log('quarter.glb ' + (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('Error loading quarter.glb:', error);
                markGlbLoaded();
            }
        );
    },
    //while it is loading, log the progress
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    //in case of error, log it
    function (error) {
        console.error('An error happened:', error);
        markGlbLoaded(); // still allow app to continue, overlay will hide
    }
);
//Instantiate new renderer and set sizes, using the existing cv_intro_body2 canvas
const renderer = new THREE.WebGLRenderer({
    canvas: cvb_2,     // use the existing 2nd canvas
    alpha: true        // transparent background
});

// Helper to sync renderer/camera to current container size + DPR
function initViewport() {
    const w = i_cont.clientWidth || vp_w;
    const h = i_cont.clientHeight || vp_h;
    if (w <= 0 || h <= 0) return;
    const pixelRatio = window.devicePixelRatio || 1;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(w, h, false);   // CSS size w x h
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

// Initial WebGL viewport setup
initViewport();
//add lights to scene
const topLight = new THREE.DirectionalLight(0xffffff, 2); // (color, intensity) - increased to 2
topLight.position.set(500, 500, 500) //top-left-ish
topLight.castShadow = true;
scene.add(topLight);
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Increased ambient light
scene.add(ambientLight);
// Add additional lights for better visibility
const frontLight = new THREE.DirectionalLight(0xffffff, 1);
frontLight.position.set(0, 0, 500);
scene.add(frontLight);
//Add control to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "quarters") {
    controls = new OrbitControls(camera, renderer.domElement);
}


//Render the scene
function animate() {
    requestAnimationFrame(animate);
        // Only render if content_0 is visible (nav_page === 0)
    if (nav_page !== 0) {
        return; // Skip rendering while on other pages
    }
    // Also check if container is actually visible in the DOM
    if (!i_cont || window.getComputedStyle(i_cont).display === 'none') {
        return; // Skip rendering if container is not displayed
    }
    // Make the shuttle move only when left mouse button is pressed
    if (object && objToRender === "shuttle" && isLeftMousePressed) {
        const deltaDeltaX = dragDeltaX - prevDragDeltaX;
        const deltaDeltaY = dragDeltaY - prevDragDeltaY;
        //if the shuttle moves the first time, the dragging advert is removed
        if(!shuttleDragged && (deltaDeltaX || deltaDeltaY)){
            shuttleDragged=true;
            shuttleDragAdvert.style.display="none";}
        accumulatedRotationY += (deltaDeltaX / vp_w) * 3;
        accumulatedRotationX += (deltaDeltaY * 2.5) / vp_h;
        prevDragDeltaX = dragDeltaX;
        prevDragDeltaY = dragDeltaY;
        object.rotation.y = accumulatedRotationY;
        object.rotation.x = accumulatedRotationX;
    }
    // Keep the two quarter objects revolving at a constant pace
    if (orbitGroup) {
        if (quarter1) quarter1.rotation.x += 0.02;
        if (quarter2) quarter2.rotation.x -= 0.02;
    }
    // 🔥 Animate flames
    const time = performance.now() * 0.001; // seconds
    for (const flame of flames) {
        // Global phase + per-flame offset
        const phase = time * 5.0 + (flame.userData.phase || 0);
        // 1) Update gradient colors every frame + subtle emissive flicker
        flame.traverse((child) => {
            if (child.isMesh) {
                updateFlameVertexColors(child);
                const mat = child.material;
                if (mat && "emissiveIntensity" in mat) {
                    const flicker = 1.3 + 0.3 * Math.sin(phase * 3.0 + child.id * 0.2);
                    mat.emissiveIntensity = flicker;
                }
            }
        });
        // 2) Shape wobble – scale + slight tip sway
        // Assume flame length is along local -X (shuttle axis)
        const baseScale = 1.0;
        const lengthScale = baseScale + 0.1 * Math.sin(phase * 2.0);
        const widthScale = baseScale + 0.05 * Math.sin(phase * 3.0 + 1.0);
        // Scale more along X (flame length)
        flame.scale.set(lengthScale, widthScale, widthScale);
        // Small rotational jitter to simulate tip movement
        const jitterAngle = 0.03; // ~1.7 degrees
        flame.rotation.y = jitterAngle * Math.sin(phase * 1.9);
        flame.rotation.z = jitterAngle * Math.cos(phase * 2.3);
    }
    renderer.render(scene, camera);
}
//Add a listener to the window so we can resize the window and camera
window.addEventListener("resize", function () {
    initViewport();
    // Recompute ticker duration based on current text and viewport
    const ticker = document.querySelector('.sm_content');
    if (ticker) {
        // avoid recalculating when the ticker is hidden (offsetWidth==0)
        if (ticker.offsetWidth > 0) {
            updateTicker(ticker.innerText);
        }
    }
    set_text(true);
});

//add mouse position listener, so we can make the shuttle move
document.onmousemove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Calculate delta movement during drag
    if (isLeftMousePressed) {
        dragDeltaX = mouseX - dragStartX;
        dragDeltaY = mouseY - dragStartY;
    }
}

//Track left mouse button clicks
document.onmousedown = (e) => {
    if (e.button === 0) { // 0 = left mouse button
        isLeftMousePressed = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragDeltaX = 0; // Reset delta for this drag session
        dragDeltaY = 0; // Reset delta for this drag session
        prevDragDeltaX = 0; // Reset previous delta
        prevDragDeltaY = 0; // Reset previous delta
    }
}

document.onmouseup = (e) => {
    if (e.button === 0) { // 0 = left mouse button
        isLeftMousePressed = false;
        dragDeltaX = 0; // Reset delta for next drag session
        dragDeltaY = 0; // Reset delta for next drag session
    }
}

//Message loop update
function updateTicker(newText) {
    // If we are not on the intro page the scrolling element is hidden, so
    // there's no point in recalculating (and it can produce bogus values).
    if (nav_page !== 0) return;
    const ticker = document.querySelector('.sm_content');
    if (!ticker) return;
    ticker.innerText = newText;
    // If the ticker is not currently laid out (hidden) we don't recompute
    // the duration here.
    const textWidth = ticker.offsetWidth;
    if (textWidth === 0) return;
    // Calculate total distance: Viewport Width + Text Width
    const viewportWidth = window.innerWidth;
    const totalDistance = viewportWidth + textWidth;
    // Set duration based on a constant speed (e.g., 150 pixels per second)
    const pixelsPerSecond = 150;
    const duration = totalDistance / pixelsPerSecond;
    ticker.style.setProperty('--duration', `${duration}s`);
}
