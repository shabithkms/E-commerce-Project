!function(i,t){var s=t(".wishlist-btn");var a=t(".wishlist-tile-container");var e=a.length;var l=localStorage.getItem("user_wishlist")||[];l.length>0&&(l=JSON.parse(localStorage.getItem("user_wishlist")));var n=function(i){t(i).toggleClass("is-active")};var r=function(i){var s=t(i).attr("data-product-handle");var a;if(t(i).hasClass("is-active")){var e=l.indexOf(s);l.splice(e,1),localStorage.setItem("user_wishlist",JSON.stringify(l))}else l.push(s),localStorage.setItem("user_wishlist",JSON.stringify(l));console.log(JSON.stringify(l))};var o=function(){s.each((function(){var i=t(this).attr("data-product-handle");l.indexOf(i)>-1&&t(this).addClass("is-active")}))};var h=function(){a.each((function(){var i=t(this).attr("data-product-handle");-1===l.indexOf(i)&&(t(this).remove(),e--)}))};var d=function(){window.location.href.indexOf("pages/wishlist")>-1&&(h(),t(".wishlist-loader").fadeOut(2e3,(function(){t(".wishlist-grid").addClass("is_visible"),t(".wishlist-hero").addClass("is_visible"),0==e?t(".wishlist-grid--empty-list").addClass("is_visible"):t(".wishlist-grid--empty-list").hide()})))};var c=function(){s.click((function(i){i.preventDefault(),r(this),n(this)}))};i.init=function(){c(),o(),d()}}(window.Wishlist=window.Wishlist||{},jQuery,void 0);
//# sourceMappingURL=/s/files/1/0012/9266/4921/t/2/assets/wishlist.js.map?v=10508188993587217434