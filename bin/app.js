define("src/app",[],function(){return{config:{activeClasses:{moz:!1,ms:!1,o:!1,webkit:!1,w3:!0}},collection:{},view:{},$el:{}}}),define("src/constants",[],function(){return{PATH_CHANGED:"path-changed",ACTOR_ORIGIN_CHANGED:"actor-origin-changed",UPDATE_CSS_OUTPUT:"update-css-output",ANIMATION_LENGTH_CHANGED:"animation-length-changed",ALERT_ERROR:"error-alert",KEYFRAME_ORDER_CHANGED:"keyframe-order-changed",INITIAL_ANIMATION_DURATION:2e3,RENDER_GRANULARITY:100,TOGGLE_FADE_SPEED:200,INITIAL_KEYFRAMES:2,ALERT_TIMEOUT:6e3,NEW_KEYFRAME_X_OFFSET:200,NEW_KEYFRAME_MILLISECOND_OFFSET:1e3,DEFAULT_CSS_OUTPUT_GRANULARITY:100,MAXIMUM_CSS_OUTPUT_GRANULARITY:200,MINIMUM_CSS_OUTPUT_GRANULARITY:5}}),define("src/utils",["src/app"],function(e){return{noop:function(){},pxToNumber:function(e){return parseInt(e,10)},trimString:function(e){return e.replace(/^\s*|\s*$/g,"")},getQueryParams:function(){var e=window.location.search.slice(1),t=e.split("&"),n={};return _.each(t,function(e){var t=e.split("=");n[t[0]]=t[1]}),n},getRotation:function(e){return parseFloat(e.attr("style").match(/rotate\((-*\d+)deg\)/)[1])},deleteAllProperties:function(e){_.each(e,function(t,n){delete e[n]})}}}),define("src/ui/checkbox",[],function(){return Backbone.View.extend({events:{change:"_onChange"},initialize:function(e){_.extend(this,e),e.callHandlerOnInit&&(this.delegateEvents(),this.$el.trigger("change"))},_onChange:function(e){this.onChange.call(this,e,this.$el.is(":checked"))}})}),define("src/ui/ease-select",["src/app","src/utils"],function(e,t){return Backbone.View.extend({events:{change:"onChange"},initialize:function(e){_.extend(this,e),_.each(Tweenable.prototype.formula,function(e,t){var n=$(document.createElement("option"),{value:t});n.html(t),this.$el.append(n)},this)},onChange:function(e){this.owner.updateEasingString()},tearDown:function(){this.remove(),t.deleteAllProperties(this)}})}),define("src/ui/auto-update-textfield",["src/utils"],function(e){return Backbone.View.extend({events:{keyup:"onKeyup",keydown:"onKeydown",blur:"onBlur"},initialize:function(e){_.extend(this,e)},onKeyup:function(e){var t=this.$el.val();this.onValReenter(t)},onKeydown:function(e){var t=+e.which;t===38?this.onArrowUp(e):t===40?this.onArrowDown(e):t===13?this.onEnterDown(e):t===27&&this.onEscapeDown(e)},tearDown:function(){this.remove(),e.deleteAllProperties(this)},onEscapeDown:function(e){this.$el.trigger("blur")},onBlur:e.noop,onArrowUp:e.noop,onArrowDown:e.noop,onEnterDown:e.noop,onValReenter:e.noop})}),define("src/ui/ease-field",["src/app","src/constants","src/utils","src/ui/auto-update-textfield"],function(app,constant,util,AutoUpdateTextFieldView){return AutoUpdateTextFieldView.extend({initialize:function(e){AutoUpdateTextFieldView.prototype.initialize.apply(this,arguments);var t=this.$el.val();this.evalEasingFormula(t),this.$el.data("lastvalidfn",t)},onValReenter:function(e){try{this.evalEasingFormula(e),this.$el.data("lastvalidfn",e),this.$el.removeClass("error"),app.view.canvas.backgroundView.update(),app.kapi.update()}catch(t){this.evalEasingFormula(this.$el.data("lastvalidfn")),this.$el.addClass("error"),publish(constant.ALERT_ERROR,[t])}},evalEasingFormula:function(formula){eval("Tweenable.prototype.formula."+this.$el.data("easename")+" = function (x) {return "+formula+"}")}})}),define("src/ui/background",["src/app","src/constants"],function(e,t){return Backbone.View.extend({initialize:function(e){_.extend(this,e),this.context=this.$el[0].getContext("2d"),this.resize({height:e.height,width:e.width});var n=_.bind(this.update,this);subscribe(t.PATH_CHANGED,n),subscribe(t.KEYFRAME_ORDER_CHANGED,n)},resize:function(e){_.each(["height","width"],function(t){if(t in e){var n={};n[t]=e[t],this.$el.css(n).attr(n)}},this)},generatePathPoints:function(){var t=e.collection.actors.getCurrent(),n=t.getLength(),r=[],i;for(i=1;i<n;++i){var s=t.getAttrsForKeyframe(i-1),o=t.getAttrsForKeyframe(i),u=s.x,a=s.y,f=o.x,l=o.y,c=t.getEasingsForKeyframe(i),h=c.x,p=c.y;r=r.concat(this.generatePathSegment(u,f,a,l,h,p))}return r},generatePathSegment:function(e,n,r,i,s,o){var u=[],a={x:e,y:r},f={x:n,y:i},l={x:s,y:o},c,h;for(c=0;c<=t.RENDER_GRANULARITY;c++)h=Tweenable.interpolate(a,f,1/t.RENDER_GRANULARITY*c,l),u.push(h);return u},generatePathPrerender:function(t){e.config.prerenderedPath=document.createElement("canvas"),e.config.prerenderedPath.width=e.view.canvas.$canvasBG.width(),e.config.prerenderedPath.height=e.view.canvas.$canvasBG.height();var n=e.config.prerenderedPath.ctx=e.config.prerenderedPath.getContext("2d"),r=this.generatePathPoints.apply(this,arguments),i;n.beginPath(),_.each(r,function(e){i?n.lineTo(e.x,e.y):n.moveTo(e.x,e.y),i=e}),n.lineWidth=1;var s=t?"rgba(255,176,0,.5)":"rgb(255,176,0)";n.strokeStyle=s,n.stroke(),n.closePath()},update:function(t){this.generatePathPrerender(t),this.$el[0].width=this.$el.width(),e.config.isPathShowing&&this.context.drawImage(e.config.prerenderedPath,0,0)}})}),define("src/ui/canvas",["src/app","src/constants","src/ui/background"],function(e,t,n){var r=$(window);return Backbone.View.extend({initialize:function(e){_.extend(this,e),this.initDOM()},initDOM:function(){var e=r.height(),t=r.width();this.$header=$("header"),this.backgroundView=new n({$el:this.$canvasBG,height:e,width:t}),r.on("resize",_.bind(this.onWindowResize,this))},onWindowResize:function(e){var t=r.height()-this.$header.outerHeight(),n=r.width();this.backgroundView.resize({height:t,width:n}),this.backgroundView.update()}})}),define("src/ui/pane",["src/app","src/constants"],function(e,t){var n=$(window);return Backbone.View.extend({CONTAINER_TEMPLATE:['<div class="pane"></div>'].join(""),HANDLE_TEMPLATE:['<div class="pane-handle"></div>'].join(""),CONTENT_WRAPPER_TEMPLATE:['<div class="pane-content"></div>'].join(""),events:{},initialize:function(e){_.extend(this,e),this.$handle=$(this.HANDLE_TEMPLATE),this.$el.wrap($(this.CONTAINER_TEMPLATE)),this.$el=this.$el.parent(),this.$el.wrapInner($(this.CONTENT_WRAPPER_TEMPLATE)).prepend(this.$handle).css({left:n.width()-this.$el.outerWidth(!0)}).dragon({within:this.$el.parent(),handle:".pane-handle"}),this.oldSize=this.getSize(),n.on("resize",_.bind(this.onResize,this))},onResize:function(e){var t=this.$el.outerWidth(!0),r=n.width();this.$el.offset().left+t>r&&this.$el.css("left",r-t)},getSize:function(){return{height:this.$el.height(),width:this.$el.width()}},toggle:function(){this.$el.fadeToggle(t.TOGGLE_FADE_SPEED)}})}),define("src/ui/tabs",[],function(){return Backbone.View.extend({ACTIVE_CLASS:"tabs-active",events:{"click .tabs li":"onTabClick"},initialize:function(e){_.extend(this,e),this.delegateEvents(),this.tabs=this.$el.find(".tabs").children(),this.contents=this.$el.find(".tabs-contents").children(),this.tabs.eq(0).trigger("click")},onTabClick:function(e){e.preventDefault();var t=$(e.currentTarget);this.tabs.removeClass(this.ACTIVE_CLASS),t.addClass(this.ACTIVE_CLASS),this.contents.css("display","none"),$("#"+t.data("target")).css("display","block")}})}),define("src/ui/css-output",["src/app"],function(e){function n(e){var n=[];return _.each(e.config.activeClasses,function(e,r){e&&n.push(t[r])}),n}var t={moz:"mozilla",ms:"microsoft",o:"opera",webkit:"webkit",w3:"w3"};return Backbone.View.extend({events:{},initialize:function(e){_.extend(this,e),this.$trigger.on("click",_.bind(this.onTriggerClick,this))},onTriggerClick:function(e){this.renderCSS()},renderCSS:function(){var t=e.kapi.toCSS({vendors:n(e),name:e.view.cssNameField.$el.val(),iterations:e.$el.animationIteration.val(),isCentered:e.config.isCenteredToPath,granularity:e.view.granularitySlider.getGranularity()});this.$el.val(t)}})}),define("src/ui/html-input",["src/app","src/utils"],function(e,t){return Backbone.View.extend({events:{keyup:"onKeyup"},initialize:function(e){_.extend(this,e),this.$renderTarget=$("#rekapi-canvas .rekapi-actor"),this.initialValue=this.readFromDOM(),this.$el.html(this.initialValue)},onKeyup:function(){this.renderToDOM()},readFromDOM:function(){return t.trimString(this.$renderTarget.html())},renderToDOM:function(){var e=this.$el.val()||this.initialValue;this.$renderTarget.html(e)}})}),define("src/ui/incrementer-field",["src/ui/auto-update-textfield"],function(e){return e.extend({increment:10,initialize:function(t){e.prototype.initialize.call(this,t)},tweakVal:function(e){this.$el.val(parseInt(this.$el.val(),10)+e),this.$el.trigger("keyup")},onArrowUp:function(){this.tweakVal(this.increment)},onArrowDown:function(){this.tweakVal(-this.increment)},tearDown:function(){e.prototype.tearDown.call(this)}})}),define("src/ui/modal",["src/app","src/constants"],function(e,t){var n=$(window);return Backbone.View.extend({initialize:function(e){_.extend(this,e),this.$el.css("display","none").removeClass("hid"),this._windowKeyhandler=_.bind(this.onWindowKeydown,this),this._windowClickhandler=_.bind(this.onWindowClick,this),this.$triggerEl.on("click",_.bind(this.onTriggerClick,this))},onTriggerClick:function(e){this.toggle(),e.stopPropagation(),e.preventDefault()},onWindowKeydown:function(e){e.keyCode===27&&this.hide()},onWindowClick:function(e){!$.contains(this.$el[0],e.srcElement)&&this.$el[0]!==e.srcElement&&this.hide()},show:function(){this.$el.fadeIn(t.TOGGLE_FADE_SPEED),n.on("keydown",this._windowKeyhandler).on("click",this._windowClickhandler)},hide:function(){this.$el.fadeOut(t.TOGGLE_FADE_SPEED),n.off("keydown",this._windowKeyhandler).off("click",this._windowClickhandler)},toggle:function(){this.$el.is(":visible")?this.hide():this.show()}})}),define("src/ui/hotkey-handler",["src/app"],function(e){return Backbone.View.extend({events:{keydown:"onKeydown",keyup:"onKeyup"},initialize:function(e){_.extend(this,e)},onKeydown:function(t){if(t.target!==this.$el[0])return;t.shiftKey?this.$el.addClass("shift-down"):t.keyCode===67?e.view.controlPane.toggle():t.keyCode===72?e.view.helpModal.toggle():t.keyCode===32?e.kapi.isPlaying()?e.kapi.pause():e.kapi.play():t.keyCode===84?e.view.rekapiControls.fadeToggle():t.keyCode===75&&e.collection.actors.getCurrent().appendNewKeyframeWithDefaultProperties()},onKeyup:function(e){this.$el.removeClass("shift-down")}})}),define("src/ui/rekapi-controls",["src/app","src/constants"],function(e,t){return Backbone.View.extend({initialize:function(t){_.extend(this,t),this.scrubber=new RekapiScrubber(e.kapi,e.view.canvas.$canvasBG[0]),this.$el=this.scrubber.$container},fadeToggle:function(){this.$el.fadeToggle(t.TOGGLE_FADE_SPEED)}})}),define("src/ui/alert",["src/app","src/constants"],function(e,t){return Backbone.View.extend({initialize:function(e){_.extend(this,e),this.fadeOutTimeout_=0,this.$contentEl_=this.$el.find("p"),subscribe(t.ALERT_ERROR,_.bind(this.show,this))},show:function(e){clearTimeout(this.fadeOutTimeout_),this.$contentEl_.text(e),this.$el.fadeIn(t.TOGGLE_FADE_SPEED),this.fadeOutTimeout_=setTimeout(_.bind(this.hide,this),t.ALERT_TIMEOUT)},hide:function(){this.$el.fadeOut(t.TOGGLE_FADE_SPEED)}})}),define("src/ui/granularity-slider",["src/app","src/constants"],function(e,t){return Backbone.View.extend({GRANULARITY_RANGE:t.MAXIMUM_CSS_OUTPUT_GRANULARITY-t.MINIMUM_CSS_OUTPUT_GRANULARITY,initialize:function(e){_.extend(this,e),this.$el.dragonSlider({drag:_.bind(this.onSliderDrag,this)});var n=(t.DEFAULT_CSS_OUTPUT_GRANULARITY-t.MINIMUM_CSS_OUTPUT_GRANULARITY)/(this.GRANULARITY_RANGE-1);this.$el.dragonSliderSet(n,!1)},onSliderDrag:function(t){e.view.cssOutput.renderCSS()},getGranularity:function(){var e=this.$el.dragonSliderGet();return t.MINIMUM_CSS_OUTPUT_GRANULARITY+e*this.GRANULARITY_RANGE}})}),define("src/model/keyframe",["src/app","src/constants"],function(e,t){return Backbone.Model.extend({initialize:function(e,n){_.extend(this,n),subscribe(t.ACTOR_ORIGIN_CHANGED,_.bind(this.modifyKeyframe,this)),this.on("change",_.bind(this.modifyKeyframe,this))},validate:function(e){var t=!1;_.each(e,function(e){typeof e!="number"&&(t=!0)});if(t)return"Number is NaN"},modifyKeyframe:function(t){e.collection.actors.getCurrent().modifyKeyframe(this.get("millisecond"),this.getCSS()),t||e.kapi.update()},moveKeyframe:function(n){e.collection.actors.getCurrent().moveKeyframe(this.get("millisecond"),n),this.set("millisecond",n),publish(t.ANIMATION_LENGTH_CHANGED)},removeKeyframe:function(){this.keyframeFormView.tearDown(),delete this.keyframeFormView,this.crosshairView.tearDown(),delete this.crosshairView,this.owner.removeKeyframe(this.get("millisecond"))},setEasingString:function(e){this.owner.modifyKeyframe(this.get("millisecond"),{},{transform:e})},getCSS:function(){return{transform:["translateX(",this.get("x"),"px) translateY(",this.get("y"),"px) rotate(",this.get("r"),e.config.isCenteredToPath?"deg) translate(-50%, -50%)":"deg)"].join("")}},getAttrs:function(){return{x:this.get("x"),y:this.get("y"),r:this.get("r")}}})}),define("src/collection/keyframes",["src/app","src/model/keyframe"],function(e,t){return Backbone.Collection.extend({model:t,initialize:function(e,t){_.extend(this,t),this.on("add",_.bind(function(e){this.owner.crosshairsView.addCrosshairView(e),this.owner.keyframeFormsView.addKeyframeView(e)},this))},comparator:function(e){return e.get("millisecond")},updateModelFormViews:function(){if(!this.models[0].keyframeFormView)return;this.each(function(e){e.keyframeFormView.render()})},updateModelCrosshairViews:function(){if(!this.models[0].crosshairView)return;this.each(function(e){e.crosshairView.render()})},removeKeyframe:function(e){this.remove(this.findWhere({millisecond:e}))}})}),define("src/ui/keyframe-form",["src/app","src/constants","src/utils","src/ui/incrementer-field","src/ui/ease-select"],function(e,t,n,r,i){function s(n){return new r({$el:n,onValReenter:_.bind(function(r){this.model.set(n.data("keyframeattr"),+r),publish(t.PATH_CHANGED),e.collection.actors.getCurrent(0).updateKeyframeCrosshairViews(),e.kapi.update()},this)})}var o=['<li class="keyframe">',"<h3></h3>",'<div class="pinned-button-array">',"</div>","</li>"].join(""),u=['<div class="property-field">',"<label>","<span>{{propertyLabel}}:</span>",'<input class="quarter-width keyframe-attr-{{property}}" type="text" data-keyframeattr="{{property}}" value="{{value}}">',"</label>","</div>"].join(""),a=['<label class="remove">',"<span>Remove this keyframe</span>",'<button class="icon icon-remove">&nbsp;</button>',"</label>"].join(""),f=['<select class="{{property}}-easing" data-axis="{{property}}"></select>'].join(""),l=['<input class="millisecond-input" type="text" value="{{value}}">'].join("");return Backbone.View.extend({events:{"click h3":"editMillisecond","click .remove button":"removeKeyframe"},initialize:function(e){_.extend(this,e),this.isEditingMillisecond=!1,this.canEditMillisecond=!this.isFirstKeyfame(),this.$el=$(o),this.initDOMReferences(),this.buildDOM(),this.model.keyframeFormView=this,this.model.on("change",_.bind(this.render,this)),this.initIncrementers(),this.render()},buildDOM:function(){var e=this.isFirstKeyfame();if(this.isRemovable()){var t=$(Mustache.render(a));this.$pinnedButtonArray.append(t)}_.each(["x","y","r"],function(t){var n=Mustache.render(u,{property:t,propertyLabel:t.toUpperCase(),value:this.model.get(t)}),r=$(n);if(!e){var i=this.initEaseSelect(t);r.append(i.$el)}this["$input"+t.toUpperCase()]=r,this.$el.append(r)},this)},initDOMReferences:function(){this.$header=this.$el.find("h3"),this.$pinnedButtonArray=this.$el.find(".pinned-button-array")},initIncrementers:function(){_.each([this.$inputX,this.$inputY,this.$inputR],function(e){var t=e.find("input"),n=t.data("keyframeattr");this["incrementerView"+n.toUpperCase()]=s.call(this,t)},this);if(!this.isFirstKeyfame()){var e=Mustache.render(l,{value:this.model.get("millisecond")});this.millisecondIncrementer=new r({$el:$(e),onBlur:_.bind(this.onMillisecondIncrementerBlur,this),onEnterDown:_.bind(function(){this.millisecondIncrementer.$el.trigger("blur")},this)})}},initEaseSelect:function(e,t){var n="easeSelectView"+e.toUpperCase(),r="input"+e.toUpperCase(),s=Mustache.render(f,{property:e}),o=this[n]=new i({$el:$(s),owner:this});return o},getKeyframeIndex:function(){return this.model.collection.indexOf(this.model)},isFirstKeyfame:function(){return this.getKeyframeIndex()===0},isRemovable:function(){return this.getKeyframeIndex()>0},onMillisecondIncrementerBlur:function(e){this.millisecondIncrementer.$el.detach();var n=this.validateMillisecond(this.millisecondIncrementer.$el.val());this.model.owner.hasKeyframeAt(n)?n!==this.model.get("millisecond")&&publish(t.ALERT_ERROR,["There is already a keyframe at millisecond "+n+"."]):(this.model.moveKeyframe(n),this.owner.model.refreshKeyframeOrder()),this.renderHeader(),this.isEditingMillisecond=!1},render:function(){this.renderHeader(),this.model.get("x")!==parseFloat(this.$inputX.val())&&this.$inputX.val(this.model.get("x")),this.model.get("y")!==parseFloat(this.$inputY.val())&&this.$inputY.val(this.model.get("y")),this.model.get("r")!==parseFloat(this.$inputR.val())&&this.$inputR.val(this.model.get("r"))},renderHeader:function(){this.$header.text(this.model.get("millisecond"))},updateEasingString:function(){var t=this.easeSelectViewX.$el.val(),n=this.easeSelectViewY.$el.val(),r=this.easeSelectViewR.$el.val(),i=[t,n,r].join(" ");this.model.setEasingString(i),e.view.canvas.backgroundView.update(),e.kapi.update()},validateMillisecond:function(e){return isNaN(e)?0:Math.abs(+e)},editMillisecond:function(){if(this.isEditingMillisecond||!this.canEditMillisecond)return;this.isEditingMillisecond=!0,this.$header.empty().append(this.millisecondIncrementer.$el),this.millisecondIncrementer.$el.val(this.model.get("millisecond")).focus()},removeKeyframe:function(){this.model.removeKeyframe()},tearDown:function(){_.each(["X","Y","R"],function(e){this["easeSelectView"+e].tearDown(),this["incrementerView"+e].tearDown(),this["$input"+e].remove()},this),this.millisecondIncrementer.tearDown(),this.$header.remove(),this.$pinnedButtonArray.remove(),this.remove(),n.deleteAllProperties(this)}})}),define("src/ui/keyframe-forms",["src/app","src/constants","src/ui/keyframe-form"],function(e,t,n){return Backbone.View.extend({events:{"click .add button":"createKeyframe"},initialize:function(e){_.extend(this,e),this.keyframeForms={}},render:function(){_.each(this.keyframeForms,function(e){e.render()})},addKeyframeView:function(e){var t=new n({owner:this,model:e});this.$formsList=this.$el.find("ul.controls"),this.keyframeForms[t.cid]=t,this.$formsList.append(t.$el)},createKeyframe:function(e){this.model.appendNewKeyframeWithDefaultProperties()},reorderKeyframeFormViews:function(){this.$formsList.children().detach();var e=this.model.getKeyframeFormViews();_.each(e,function(e){this.$formsList.append(e.$el)},this)}})}),define("src/ui/crosshair",["src/app","src/constants","src/utils"],function(e,t,n){var r=$(window);return Backbone.View.extend({events:{"mousedown .rotation-arm":"onClickRotationArm"},initialize:function(e){_.extend(this,e),this.$el.dragon({within:this.owner.$el.parent(),dragStart:_.bind(this.dragStart,this),dragEnd:_.bind(this.dragEnd,this)}),this.$el.css("transform","rotate(0deg)"),this.model.on("change",_.bind(this.render,this)),this._isRotating=!1,this.model.crosshairView=this,this.render()},onClickRotationArm:function(e){this.startRotating(e.clientX,e.clientY),e.stopPropagation()},onMouseupRotatorArm:function(e){this.stopRotating()},onMouseMoveRotator:function(e){this.rotateForDragDelta(e.clientX,e.clientY)},onKeyupRotator:function(e){this.stopRotating()},dragStart:function(e,t){this.dimPathLine()},dragEnd:function(n,r){this.updateModel(),e.view.cssOutput.renderCSS(),publish(t.UPDATE_CSS_OUTPUT)},render:function(){this.$el.css({left:this.model.get("x")+"px",top:this.model.get("y")+"px",transform:"rotate("+this.model.get("r")+"deg)"})},updateModel:function(){var r=n.pxToNumber;this.model.set({x:r(this.$el.css("left")),y:r(this.$el.css("top")),r:n.getRotation(this.$el)}),publish(t.PATH_CHANGED),e.collection.actors.getCurrent().updateKeyframeFormViews(),e.kapi.update()},dimPathLine:function(){e.view.canvas.backgroundView.update(!0)},startRotating:function(e,t){this._previousRotationDragX=0,this._previousRotationDragY=0,this._currentRotationDragX=e,this._currentRotationDragY=t,this._mouseupHandler=_.bind(this.onMouseupRotatorArm,this),this._mousemoveHandler=_.bind(this.onMouseMoveRotator,this),this._keyupHandler=_.bind(this.onKeyupRotator,this),this._isRotating=!0,r.on("mouseup",this._mouseupHandler).on("mousemove",this._mousemoveHandler).on("keyup",this._keyupHandler)},stopRotating:function(){this._isRotating=!1,this.updateModel(),r.off("mouseup",this._mouseupHandler).off("mousemove",this._mousemoveHandler).off("keyup",this._keyupHandler)},rotateForDragDelta:function(e,t){this._previousRotationDragX=this._currentRotationDragX,this._previousRotationDragY=this._currentRotationDragY,this._currentRotationDragX=e,this._currentRotationDragY=t;var r=e-this._previousRotationDragX,i=t-this._previousRotationDragY,s=r+i,o=n.getRotation(this.$el),u=o+s;this.$el.css("transform","rotate("+u+"deg)")},tearDown:function(){this.remove(),n.deleteAllProperties(this)}})}),define("src/ui/crosshairs",["src/app","src/ui/crosshair"],function(e,t){var n=['<div class="crosshair">','<div class="dashmark horiz"></div>','<div class="dashmark vert"></div>','<div class="rotation-arm">','<div class="rotation-handle">',"</div>","</div>"].join("");return Backbone.View.extend({initialize:function(e){_.extend(this,e),this.crosshairViews={}},addCrosshairView:function(r){var i=e.collection.actors.getCurrent().getLength(),s=$(Mustache.render(n));this.$el.append(s),this.crosshairViews[r.cid]=new t({$el:s,model:r,owner:this})},reorderCrosshairViews:function(){this.$el.children().detach();var e=this.model.getCrosshairViews();_.each(e,function(e){this.$el.append(e.$el)},this)}})}),define("src/model/actor",["src/app","src/constants","src/collection/keyframes","src/ui/keyframe-forms","src/ui/crosshairs"],function(e,t,n,r,i){return Backbone.Model.extend({initialize:function(e,t){_.extend(this,t),this.keyframeCollection=new n([],{owner:this}),this.keyframeFormsView=new r({$el:$("#keyframe-controls"),model:this}),this.crosshairsView=new i({$el:$("#crosshairs"),model:this})},getLength:function(){return this.keyframeCollection.length},getAttrsForKeyframe:function(e){return this.keyframeCollection.at(e).getAttrs()},getMillisecondOfKeyframe:function(e){return+this.keyframeCollection.at(e).get("millisecond")},getKeyframeFormViews:function(){return _.pluck(this.keyframeCollection.models,"keyframeFormView")},getCrosshairViews:function(){return _.pluck(this.keyframeCollection.models,"crosshairView")},getEasingsForKeyframe:function(e){var t=this.get("actor").getKeyframeProperty("transform",e),n=t.easing.split(" ");return{x:n[0],y:n[1],r:n[2]}},updateKeyframeFormViews:function(){this.keyframeCollection.updateModelFormViews()},updateKeyframeCrosshairViews:function(){this.keyframeCollection.updateModelCrosshairViews()},refreshKeyframeOrder:function(){this.keyframeCollection.sort(),this.keyframeFormsView.reorderKeyframeFormViews(),this.crosshairsView.reorderCrosshairViews(),e.kapi.update(),publish(t.KEYFRAME_ORDER_CHANGED)},appendNewKeyframeWithDefaultProperties:function(){var n=this.getLength()-1,r=this.getMillisecondOfKeyframe(n),i=this.getAttrsForKeyframe(n),s=r+t.NEW_KEYFRAME_MILLISECOND_OFFSET;this.keyframe(s,{x:i.x+t.NEW_KEYFRAME_X_OFFSET,y:i.y,r:0},"linear linear linear"),e.view.canvas.backgroundView.update()},keyframe:function(e,n,r){var i=_.extend({millisecond:e},n);this.keyframeCollection.add(i,{owner:this});var s=this.keyframeCollection.last().getCSS();this.get("actor").keyframe(e,s,r),publish(t.UPDATE_CSS_OUTPUT)},modifyKeyframe:function(e,t,n){var r=this.get("actor");r.modifyKeyframe.apply(r,arguments)},hasKeyframeAt:function(e){var t=this.get("actor");return t.hasKeyframeAt.apply(t,arguments)},moveKeyframe:function(e,t){var n=this.get("actor");return n.moveKeyframe.apply(n,arguments)},removeKeyframe:function(e){this.keyframeCollection.removeKeyframe(e),this.get("actor").removeKeyframe(e),publish(t.PATH_CHANGED)}})}),define("src/collection/actors",["src/app","src/constants","src/model/actor"],function(e,t,n){return Backbone.Collection.extend({model:n,getCurrent:function(){return this.at(0)},syncFromAppKapi:function(){this.reset(),_.each(e.kapi.getAllActors(),function(e){this.add(new this.model({actor:e}))},this)}})}),require(["src/app","src/constants","src/utils","src/ui/checkbox","src/ui/ease-select","src/ui/ease-field","src/ui/auto-update-textfield","src/ui/canvas","src/ui/pane","src/ui/tabs","src/ui/css-output","src/ui/html-input","src/ui/incrementer-field","src/ui/modal","src/ui/hotkey-handler","src/ui/rekapi-controls","src/ui/alert","src/ui/granularity-slider","src/collection/actors"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y){var b=$(window);e.config.queryString=n.getQueryParams(),navigator.userAgent.match(/Macintosh/)&&$(document.body).addClass("mac"),navigator.userAgent.match(/WebKit/)&&$(document.body).addClass("webkit"),$(".ease").each(function(t,n){e.view["easeField"+t]=new s({$el:$(n)})}),e.view.hotkeyHandler=new d({$el:$(document.body)}),e.view.helpModal=new p({$el:$("#help-contents"),$triggerEl:$("#help-trigger")}),e.$el.animationIteration=$("#iterations");var w=$("#crosshairs .crosshair:first").height()/2,E=b.height()/2-w;e.kapi=new Kapi({context:document.getElementById("rekapi-canvas"),height:b.height(),width:b.width()}),e.collection.actors=new y,e.kapi.on("addActor",_.bind(e.collection.actors.syncFromAppKapi,e.collection.actors));var S=new Kapi.DOMActor($("#rekapi-canvas").children()[0]);e.kapi.addActor(S);var x=b.width(),T=e.collection.actors.getCurrent();_.each([0,t.INITIAL_ANIMATION_DURATION],function(e,t){T.keyframe(e,{x:t?x-x/(t+1):40,y:E,r:0},"linear linear linear")}),e.view.canvas=new u({$el:$("#rekapi-canvas"),$canvasBG:$("#tween-path")}),e.view.rekapiControls=new v,e.config.queryString.debug||e.kapi.play(),e.view.showPath=new r({$el:$("#show-path"),callHandlerOnInit:!0,onChange:function(t,n){e.config.isPathShowing=!!n,e.kapi.update(),e.view.canvas.backgroundView.update()}}),e.view.controlPane=new a({$el:$("#control-pane")}),e.view.controlPaneTabs=new f({$el:$("#control-pane")}),e.view.cssOutput=new l({$el:$("#css-output textarea"),$trigger:e.view.controlPaneTabs.$el.find('[data-target="css-output"]')}),e.view.granularitySlider=new g({$el:$(".quality-slider.granularity .slider")}),subscribe(t.UPDATE_CSS_OUTPUT,function(){e.view.cssOutput.renderCSS()}),e.view.cssNameField=new o({$el:$("#css-name"),onKeyup:function(n){e.config.className=n,publish(t.UPDATE_CSS_OUTPUT)}}),e.view.mozCheckbox=new r({$el:$("#moz-toggle"),onChange:function(n,r){e.config.activeClasses.moz=r,publish(t.UPDATE_CSS_OUTPUT)}}),e.view.msCheckbox=new r({$el:$("#ms-toggle"),onChange:function(n,r){e.config.activeClasses.ms=r,publish(t.UPDATE_CSS_OUTPUT)}}),e.view.oCheckbox=new r({$el:$("#o-toggle"),onChange:function(n,r){e.config.activeClasses.o=r,publish(t.UPDATE_CSS_OUTPUT)}}),e.view.webkitCheckbox=new r({$el:$("#webkit-toggle"),onChange:function(n,r){e.config.activeClasses.webkit=r,publish(t.UPDATE_CSS_OUTPUT)}}),e.view.w3Checkbox=new r({$el:$("#w3-toggle"),onChange:function(n,r){e.config.activeClasses.w3=r,publish(t.UPDATE_CSS_OUTPUT)}}),e.view.htmlInput=new c({$el:$("#html-input textarea")}),e.view.centerToPathCheckbox=new r({$el:$("#center-to-path"),callHandlerOnInit:!0,onChange:function(n,r){e.config.isCenteredToPath=!!r;var i=e.config.isCenteredToPath?"0 0":"";e.view.htmlInput.$renderTarget.css("transform-origin",i),publish(t.ACTOR_ORIGIN_CHANGED,[!0]),e.kapi.update()}}),e.view.topLevelAlert=new m({$el:$("#top-level-alert")}),$(window).trigger("resize"),e.config.queryString.debug&&(window.app=e)}),define("src/init",function(){});