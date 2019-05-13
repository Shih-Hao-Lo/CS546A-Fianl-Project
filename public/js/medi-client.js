function logout() {
  $.ajax({
    url: '/logout',
    type: 'GET',
    success: function (res) {
      alert('logged out');
    },
    error: function (err) {
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
  if ($(elem)) $(elem).fadeIn();
}
function hideElement(elem) {
  if ($(elem)) $(elem).hide();
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
function viewPrescription(resId) {
  location.href = `/prescription/view?resId=${resId}`;
}
function addPrescription() {
  let diagnosis = $('textarea[name="diagnosis"]').val();
  let medsPrescribed = $("#medicines").val();
  let roomId = $('#room').val();
  let resId = $('input[name="reservation_id"]').val();
  let days = $('#days').val();

  console.log(`diagnosis: ${diagnosis}; medsPrescribed: ${medsPrescribed}; roomId: ${roomId}; resId: ${resId}`);
  $.ajax({
    url: '/prescription/add',
    type: 'POST',
    data: {
      diagnosis,
      medsPrescribed,
      days,
      roomId,
      resId
    },
    success: function () { location.href = `/reservation/${resId}` },
    error: function () { alert('failed') }
  })
}
function generateBill(resId) {
  window.open(
    `/reservation/${resId}/bill`,
    '_blank'
  );
}
function updateReservationStatus(resId) {
  let status = $('select[name="reservation_status"]').val();
  // alert(`updating status for ${resId} to ${status}`);
  let confirmation = confirm(`Are you sure you want to update the booking status to: ${status}`);
  if (confirmation) {
    $.ajax({
      url: `/reservation/${resId}/status/update?newStatus=${status}`,
      type: 'POST',
      success: function () {
        alert(`Booking status updated`);
      },
      error: function () {
        alert('Failed to update status');
      }
    })
  }
}

$(document).ready(function () {

  $("#medicines").change(function () {
    // alert("something changed");
    var selectedOptions = getSelectedOptions(this);
    var price = 0;
    // var selectedIndex = this.options.selectedIndex;
    // alert(selectedOptions[0].getAttribute('price'));
    if (selectedOptions) {
      selectedOptions.forEach(function (elem) {
        price += parseInt(elem.getAttribute('price'));
      })
    }
    $(this).attr('price', price);
    var total = getTotalCost(this, '#room');
    updatePriceField(total);
    // alert(price);
  });
  $("#room").change(function () {
    // alert("room changed");
    var selectedOptions = getSelectedOptions(this);
    var price = 0;
    if (selectedOptions) {
        price += parseInt(selectedOptions[0].getAttribute('price'));
        price *= $("#days")[0].value;
    }
    // alert(price);
    $(this).attr('price', price);
    var total = getTotalCost(this, '#medicines');
    updatePriceField(total);
  });
    // New add
    $("#days").change(function () {       
        var selectedOptionsRoom = getSelectedOptions($("#room")[0]);
        var price = 0;
        price += parseInt(selectedOptionsRoom[0].getAttribute('price'));
        price *= $("#days")[0].value;
        $("#room").attr('price', price);
        var total = getTotalCost("#room", '#medicines');
        updatePriceField(total);
    });

  function getTotalCost(elem1, elem2) {
    var price1 = parseInt($(elem1).attr('price'));
    var price2 = parseInt($(elem2).attr('price'));
    var totalPrice = price1 + price2;
    return totalPrice;
  }
  function updatePriceField(val) {
    $('#total_cost').text(`$${val.toFixed(2)}`);
    $('#total_cost').attr('price', val.toFixed(2));
  }
  function getSelectedOptions(selectBox) {
    var optionList = selectBox.options;
    var selectedOption = [];
    for (var i = 0; i < optionList.length; i++) {
      if (optionList[i].selected) {
        selectedOption.push(optionList[i]);
      }
    }
    return selectedOption;
  }
})

function updatedoc(selectObject) {
  //alert(selectObject.value.length);
  if(selectObject.value.length == 0){
    location.href = '/reservation/new';
  }
  $.ajax({
    url: `/doctors/search/${selectObject.value}`,
    type: 'GET',
    success: function (res) {
      //alert(res);
      var List = document.getElementById("drlist");
      while (List.firstChild) {
        List.removeChild(List.firstChild);
      }
      //var out = '';
      var a = document.createElement("OPTION");
      var t = document.createTextNode('');
      a.appendChild(t);
      List.appendChild(a);
      for (var x = 0; x < res.length; x++) {
        //out = out + res[x].fname + res[x].lname;
        var a = document.createElement("OPTION");
        var t = document.createTextNode(res[x].fname + "  " + res[x].lname);
        a.appendChild(t);
        a.value = res[x]._id;
        List.appendChild(a);
      }
      //alert(out);
    },
    error: function (err) {

    }
  });
}

function Pay(reservation){
  //alert(reservation);
  //alert('this will redirect to payment');
  location.href = '/reservation/pay/'+reservation;
}

function deleteres(reservation){
  //alert('this will delete the reservation');
  location.href = '/reservation/delete/'+reservation;
}

function checkemail(email){
  $.ajax({
    url:'/emailcheck/'+email.value,
    type: 'GET',
    success: function(res) {
      var msg = document.getElementById("emailerror");
      if(res){
        if(!msg.classList.contains("hidden")){
          msg.classList.add("hidden");
        }
      }
      else{
        msg.classList.remove("hidden");
      }
    }
  });
}
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

function DateRestrict() {
    let today = new Date();
    let day = today.getDate();
    let month = today.getMonth() + 1;
    let year = today.getFullYear();
    if (day < 10) {
        day = '0' + day
    }
    if (month < 10) {
        month = '0' + month
    }

    today = year + '-' + month + '-' + day;
    document.getElementById("resvDate").setAttribute("min", today);
}
