async function absRelSwitchSet(){
    let abs_rel_sw = d3.select("#abs_rel_switch");

    abs_rel_sw.on("change", function(){
        if (this.checked){  
            changeToRelative(true);   
        } else {
            changeToRelative(false);
        }
    });
}