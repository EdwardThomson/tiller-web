var vid = document.getElementById("interactionsVideo").firstChild;
vid.setAttribute("playsinline", "");
vid.setAttribute("muted", "");

$("#touchButton").click( function() { vid.currentTime = 0; });
$("#turnButton").click( function() { vid.currentTime = 5.5; });
$("#tapButton").click( function() { vid.currentTime = 11.2; });
$("#doubleTapButton").click( function() { vid.currentTime = 18.12; });

const touchProgress = $("#touchButton .lrw-c-interactions__button__progress");
    const turnProgress = $("#turnButton .lrw-c-interactions__button__progress");
    const tapProgress = $("#tapButton .lrw-c-interactions__button__progress");
    const doubleTapProgress = $("#doubleTapButton .lrw-c-interactions__button__progress");


    

function trackPlayback() {
    var vidTime = vid.currentTime;
    //console.log('vidTime:', vidTime);
    
    if (vidTime >= 18.12) {
        touchProgress.width("0%");
        turnProgress.width("0%");
        tapProgress.width("0%");
        doubleTapProgress.width(`${(vidTime - 18.12)/6.39*100}%`);
        
        $("#touchButton").removeClass('lrw-c-interactions__button--active');
            $("#turnButton").removeClass('lrw-c-interactions__button--active');
            $("#tapButton").removeClass('lrw-c-interactions__button--active');
            $("#doubleTapButton").addClass('lrw-c-interactions__button--active');
        
    } else if (vidTime >= 11.2) {
        touchProgress.width("0%");
        turnProgress.width("0%");
        tapProgress.width(`${(vidTime - 11.2)/6.98*100}%`);
        doubleTapProgress.width("0%");
        
        $("#touchButton").removeClass('lrw-c-interactions__button--active');
            $("#turnButton").removeClass('lrw-c-interactions__button--active');
            $("#tapButton").addClass('lrw-c-interactions__button--active');
            $("#doubleTapButton").removeClass('lrw-c-interactions__button--active');
        
    } else if (vidTime >= 5.5) {
        touchProgress.width("0%");
        turnProgress.width(`${(vidTime - 5.5)/5.7*100}%`);
        tapProgress.width("0%");
        doubleTapProgress.width("0%");
        
        $("#touchButton").removeClass('lrw-c-interactions__button--active');
            $("#turnButton").addClass('lrw-c-interactions__button--active');
            $("#tapButton").removeClass('lrw-c-interactions__button--active');
            $("#doubleTapButton").removeClass('lrw-c-interactions__button--active');
        
    } else {        
        touchProgress.width(`${(vidTime)/5.5*100}%`);
        turnProgress.width("0%");
        tapProgress.width("0%");
        doubleTapProgress.width("0%");
        
        $("#touchButton").addClass('lrw-c-interactions__button--active');
            $("#turnButton").removeClass('lrw-c-interactions__button--active');
            $("#tapButton").removeClass('lrw-c-interactions__button--active');
            $("#doubleTapButton").removeClass('lrw-c-interactions__button--active');
    }
    
    
    
    requestAnimationFrame(trackPlayback);
}

trackPlayback();