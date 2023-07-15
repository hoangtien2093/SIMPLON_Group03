var app = angular.module("myApp", ["ngRoute"]);
//1. CẤU HÌNH ROUTE
app.config(function($routeProvider){ 
    $routeProvider
    .when("/", {
        templateUrl: "Home.html",
        controller: "myCtrl"
    })

    .when("/gallery", {
        templateUrl: "Gallery.html",
        controller: "myCtrl"
    })

    .when("/products", {
        templateUrl: "Products.html",
        controller: "myCtrl"
    })
    
    .when("/aboutus", {
        templateUrl: "AboutUs.html",
        controller: "myCtrl"
    })

    .when("/contactus", {
        templateUrl: "ContactUs.html",
        controller: "myCtrl"
    })
});
  

// ----------------------------
//2. PHÁT TRIỂN CONTROLLER
app.controller('myCtrl', function($scope, $http){
  
    //-----------------   LOAD DATA   -----------------------
    function getData(){
        $http.get('DataBase.json')
        .then(function(response){
            if (sessionStorage.getItem("sesProducts")==null){
                // Write data to Session Storage
                sessionStorage.setItem("sesProducts", JSON.stringify(response.data.products));
                sessionStorage.setItem("sesCart", JSON.stringify(response.data.cart));
                sessionStorage.setItem("sesCategories", JSON.stringify(response.data.categories));
                sessionStorage.setItem("sesCount", JSON.stringify(response.data.countitem));
                // Read data from Session Storage
                $scope.productsList = JSON.parse(sessionStorage.getItem("sesProducts"));
                $scope.shoppingcart = JSON.parse(sessionStorage.getItem("sesCart"));
                $scope.categories = JSON.parse(sessionStorage.getItem("sesCategories"));
                $scope.count = JSON.parse(sessionStorage.getItem("sesCount"));
            } else {
                $scope.productsList = JSON.parse(sessionStorage.getItem("sesProducts"));
                $scope.shoppingcart = JSON.parse(sessionStorage.getItem("sesCart"));
                $scope.categories = JSON.parse(sessionStorage.getItem("sesCategories"));
                $scope.count = JSON.parse(sessionStorage.getItem("sesCount"));
            }
        })
    }
    getData();   // Load data


    //----------------    SHOPPING CART  -------------------
    //----- Check exist item in Shopping Cart
    var findItemById = function(items, id) {
        return _.find(items, function(item) {
            return item.id === id;
        });
    };
    //----- Calculate the Cost ( for each type of products)
    $scope.getCost = function(item) {
        return (item.qty * item.price);
    };

    //----- Add products item to Shopping Cart
    $scope.addItem = function(itemToAdd) {
        showAddedAlert();
        getStorage();
        var found = findItemById($scope.shoppingcart, itemToAdd.id);
        if (found) {
            found.qty += itemToAdd.qty;
            setStorage();
        }
        else {
            $scope.shoppingcart.push(angular.copy(itemToAdd));
            $scope.count++;
            // document.getElementById('countqty').reload();
            setStorage();
            notice();
        }
    };

    //------  Calculate the TOTAL COST 
    $scope.getTotal = function() {
        var total =  _.reduce($scope.shoppingcart, function(sum, item) {
            return sum + $scope.getCost(item);
        }, 0);
        console.log('total: ' + total);
        return total.toFixed(2);
    };

    //------ Remove item from Shopping Cart
    $scope.removeItem = function(item) {
        var index = $scope.shoppingcart.indexOf(item);
        $scope.shoppingcart.splice(index, 1);
        $scope.count -= 1;
        setStorage();
    };
    //----- Remove item when decrease quantity to 0
    function removeQty(item){
        var index = $scope.shoppingcart.indexOf(item);
        $scope.shoppingcart.splice(index, 1);
        $scope.count -= 1;
        setStorage();
    };
    
    //----- Increse quantity of item
    $scope.increaseQty = function(itemInCart) {
        itemInCart.qty += 1;
        setStorage()
        
    };

    //----- Decrease quantity of item
    $scope.decreaseQty = function(itemInCart) {
        if (itemInCart.qty ===1) {
            removeQty(itemInCart)
        } else {
            itemInCart.qty -= 1;
            setStorage();
        }   
    };

    //----- Clear ALL item in Shopping Cart
    $scope.clearCart = function() {
        $scope.shoppingcart.length = 0;
        $scope.count = 0;
        setStorage();

    };

    $scope.placeOrder = function() {
        showSuccessAlert();
        $scope.shoppingcart.length = 0;
        $scope.count = 0;
        setStorage();
    }

    //----- Save data of Shopping Cart to Session Storage
    function setStorage() {
        var data = JSON.stringify($scope.shoppingcart);
        sessionStorage.setItem("sesCart", data);
        var countdata = JSON.stringify($scope.count);
        sessionStorage.setItem("sesCount",countdata);
    }

    //----- Load data of Shopping Cart from Session Storage
    function getStorage() {
        $scope.shoppingcart = JSON.parse(sessionStorage.getItem("sesCart"));
        $scope.count = JSON.parse(sessionStorage.getItem("sesCount"));
    }

    //************************************************************************//

    // ------------  SEARCH PRODUCTS AND CATEGORY FILTER --------------
    
    //----- Get Value of Category when Click on Category Button
    $scope.keyWord = '';
    $scope.getCat = function(category) {
        $scope.keyWord = category;
        sessionStorage.setItem("sesKey",JSON.stringify($scope.keyWord));
        $scope.categoryTitle = category;
        sessionStorage.setItem("sesCatTitle",JSON.stringify($scope.categoryTitle));
    };
    //----- Get Keyword From SearchBar
    $scope.getKeyword = function() {
        $scope.keyWord = document.getElementById('txtSearch').value;
        sessionStorage.setItem("sesKey",JSON.stringify($scope.keyWord));
        $scope.categoryTitle = "Search Result For " + "' " + $scope.keyWord + " '" ;
        sessionStorage.setItem("sesCatTitle",JSON.stringify($scope.categoryTitle));
    };

    //------- Get ID of Products
    $scope.getID = function(id) {
        $scope.keyWord = id;
        sessionStorage.setItem("sesKey",JSON.stringify($scope.keyWord));
        $scope.categoryTitle = "SIMPLON BEAUTY CARE" ;
        sessionStorage.setItem("sesCatTitle",JSON.stringify($scope.categoryTitle));
    };

    //----- Filter Products by Category or by Keyword
    $scope.filterProducts = function(item) {
        $scope.keyWord = JSON.parse(sessionStorage.getItem("sesKey"));
        if ($scope.keyWord=='ALL PRODUCTS') {
            $scope.keyWord = '';
        } 
        $scope.categoryTitle = JSON.parse(sessionStorage.getItem("sesCatTitle"));
        return !$scope.keyWord || item.category === $scope.keyWord || item.id === $scope.keyWord ||
                item.name.toLowerCase().indexOf($scope.keyWord.toLowerCase()) !==-1 ||
                item.category.toLowerCase().indexOf($scope.keyWord.toLowerCase()) !==-1;;       
    };

    
    
    //************************************************************************** *******
    
    //-----------------------------  PAGINATION ---------------------------------
    // Số sản phẩm hiển thị trên mỗi trang
    $scope.pageSize = 12;
    // Trang hiện tại
    $scope.currentPage = 0;
    // danh sách sản phẩm bằng rỗng
    $scope.productsList = [];

    // Tính toán số trang
    $scope.numberOfPages=function(){
        $scope.numberOfProducts = parseInt(document.getElementById('filterLength').textContent);
        var len = Math.ceil($scope.numberOfProducts/$scope.pageSize);
        $scope.pageArray = [];
        for( var i = 0; i < len; i++ ){
            $scope.pageArray.push( i);
        }          
    };
    
    for (var i=0; i<$scope.productsList.length; i++) {
        $scope.data.push("sesProducts"+i);
    };
    //-----   Go to the First Page of Products
    $scope.toFirstPage = function() {
        $scope.currentPage = 0;
    };
    //------ Highlight SelectedPage
    $scope.clickedPage = null;
    $scope.setClickedPage = function(index) {
        $scope.clickedPage = index;
        window.scrollTo({top: 250, behavior: 'smooth'});
    }

    /*************************************************************************** */

    // ------------------- DISPLAY ALERT -----------------------
    // ----- Add to Cart Alert 
    $("#successFeedback").hide();
    $("#addedAlert").hide();
    function showAddedAlert() {
        $("#addedAlert").fadeTo(500, 500).slideUp(500, function() {
            $("#addedAlert").slideUp(500);
        });
    };
    
    //----- Success Place Order Alert
    $("#successOrder").hide();
    function showSuccessAlert() {
        $("#successOrder").fadeTo(4000, 500).slideUp(500, function() {
            $("#successOrder").slideUp(500);
        });
    };

    window.onload = function() {
        var reloading = sessionStorage.getItem("reloading");
        if (reloading) {
            sessionStorage.removeItem("reloading");
            $('#submitOrderBtn').submit(function() {
                $('#placeorder').modal('hide');
                return false;
            });
            showSuccessAlert();
        } 
    }
    
    $scope.confirmOrder = function() {
        sessionStorage.setItem("reloading", "true");
        $scope.shoppingcart.length = 0;
        $scope.count = 0;
        setStorage();
        window.location.reload();
    }
    
  // ========================================================================================================
    // ------ Slide Product at HomePage
    $scope.nextslide = function() {
        let lists = document.querySelectorAll('.item');
        document.getElementById('slide').appendChild(lists[0]);
        
    }
    $scope.prevslide = function() {
        let lists = document.querySelectorAll('.item');
        document.getElementById('slide').prepend(lists[lists.length-1]);
    }

    // ------ Gallery Carousel
    let slider = document.querySelector('.slider .list');
    let items = document.querySelectorAll('.slider .list .item_gallery');
    let dots = document.querySelectorAll('.slider .dots li');
    let next = document.getElementById('next');

    let lengthItems = items.length - 1;
    let active = 0;
    $scope.nextGal = function(){
        active = active + 1 <= lengthItems ? active + 1 : 0;
        reloadSlider();
    }
    $scope.prevGal = function(){
        active = active - 1 >= 0 ? active - 1 : lengthItems;
        reloadSlider();
    }
    let refreshInterval = setInterval(()=> {next.click()}, 3000);
    function reloadSlider(){
        slider.style.left = -items[active].offsetLeft + 'px';
        // 
        let last_active_dot = document.querySelector('.slider .dots li.active');
        last_active_dot.classList.remove('active');
        dots[active].classList.add('active');

        clearInterval(refreshInterval);
        refreshInterval = setInterval(()=> {next.click()}, 3000);
    }

    dots.forEach((li, key) => {
        li.addEventListener('click', ()=>{
            active = key;
            reloadSlider();
        })
    })
    window.onresize = function(event) {
        reloadSlider();
    };
    

   
});

app.filter('startFrom', function() {
  return function(input, start) {
      start = +start; //parse to int
      return input.slice(start); 
  }
});
// ==================================================================================================
// ------------------------------

  function openNav() {
    
    document.getElementById("mySidepanel").style.height = "150px";
  }
  
  function closeNav() {
    document.getElementById("mySidepanel").style.height = "0";
  }
// ------------------------------------

function autoSpace() {    
    var inputdebit = document.getElementById("creditnumber");
  if (inputdebit.value.length == 4) {
            inputdebit.value += " ";
     }
     if (inputdebit.value.length > 4) {
       if (inputdebit.value.length % 5 ==4) {
         inputdebit.value += " "; }
     }
}

// ----- Success Feedback Alert 
function showFeedbackAlert() {
    document.getElementById('fullName').value='';
    document.getElementById('Email').value='';
    document.getElementById('message').value='';
    $("#successFeedback").fadeTo(3000, 500).slideUp(500, function() {
        $("#successFeedback ").slideUp(500);
    });
};

