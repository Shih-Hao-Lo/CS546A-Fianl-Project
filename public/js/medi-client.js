function logout() {
  $.ajax({
    url: '/logout',
    type: 'GET',
    success: function(res) {
      alert('logged out');
    },
    error: function(err) {
      alert('failed to log out');
    }
  })
}

function newReservation() {
  location.href = '/reservation/new';
}
function viewReservation() {
  location.href = '/reservation';
}
function showForm(form, hideElem) {
  showElement(form);
  hideElement(hideElem);
}
function showElement(elem) {
  if($(elem))  $(elem).fadeIn();
}
function hideElement(elem) {
  if($(elem))  $(elem).hide();
}
function enableForm(formId) {
  $(`#${formId}`).find('input').removeAttr('disabled');
  $(`#${formId}`).find('select').removeAttr('disabled');
  $(`#${formId}`).find('.edit_buttons_cont').addClass('hidden');
  $(`#${formId}`).find('.resch_buttons_cont').removeClass('hidden');
}
function cancelResch(formId) {
  $(`#${formId}`).find('input').attr('disabled', true);
  $(`#${formId}`).find('select').attr('disabled', true);
  $(`#${formId}`).find('.edit_buttons_cont').removeClass('hidden');
  $(`#${formId}`).find('.resch_buttons_cont').addClass('hidden');
}
function createPrescription(resId) {
  location.href = `/prescription/add?resId=${resId}`;
}

$(document).ready(function() {
  $("#medicines").change(function() {
    // alert("something changed");
    var selectedOptions = getSelectedOptions(this);
    var price = 0;
    // var selectedIndex = this.options.selectedIndex;
    // alert(selectedOptions[0].getAttribute('price'));
    if(selectedOptions) {
      selectedOptions.forEach(function(elem) {
        price += parseInt(elem.getAttribute('price'));
      })
    }
    $(this).attr('price', price);
    var total = getTotalCost(this, '#room');
    updatePriceField(total);
    // alert(price);
  });
  $("#room").change(function() {
    // alert("room changed");
    var selectedOptions = getSelectedOptions(this);
    var price = 0;
    if(selectedOptions) {
      price += parseInt(selectedOptions[0].getAttribute('price'));
    }
    // alert(price);
    $(this).attr('price', price);
    var total = getTotalCost(this, '#medicines');
    updatePriceField(total);
  });

  function getTotalCost(elem1, elem2) {
    var price1 = parseInt($(elem1).attr('price'));
    var price2 = parseInt($(elem2).attr('price'));
    var totalPrice = price1 + price2;
    return totalPrice;
  }
  function updatePriceField(val) {
    $('#total_cost').text(`$${val}`);
    $('#total_cost').attr('price', val);
  }
  function getSelectedOptions(selectBox) {
    var optionList = selectBox.options;
    var selectedOption = [];
    for(var i=0; i<optionList.length; i++) {
      if(optionList[i].selected) {
        selectedOption.push(optionList[i]);
      }
    }
    return selectedOption;
  }
})


// ======== Edit Profile & PWD ======== //

function editProfile() {
  location.href = '/edit-profile';
}

function backToDashboard() {
  location.href = '/dashboard';
}

function changePWD() {
  location.href = '/change-password';
}