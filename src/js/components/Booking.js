import { templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getDate();

    thisBooking.selectedTable = '';
  }

  getDate(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerElem.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerElem.maxDate);

    const params = {
      booking : [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    //console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event  
                                     + '?' + params.eventsRepeat.join('&'),
    };

    //console.log('getData urls', url);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log('bookings', bookings);
        console.log('eventsCurrent', eventsCurrent);
        console.log('eventsRepeat', eventsRepeat);
      });
  }

  initTables(clickedTable) {
    const thisBooking = this;
    
    if (clickedTable.classList.contains(classNames.booking.tableBooked)) {
      alert('This table is booked');
      return;
    }

    if (!clickedTable.classList.contains(classNames.booking.tableSelected)) {

      const activeTable = thisBooking.dom.floor.querySelector(select.booking.tableSelected);
      if (activeTable) activeTable.classList.remove(classNames.booking.tableSelected);

      clickedTable.classList.add(classNames.booking.tableSelected);
      thisBooking.selectedTable = clickedTable.getAttribute('data-table');
    } else {
      clickedTable.classList.remove(classNames.booking.tableSelected);
      thisBooking.selectedTable = '';
    }
  }

  render(element){
    const thisBooking = this;
    const generatedHtml = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHtml;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.widgets.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.widgets.booking.hoursAmount);
    thisBooking.dom.datePickerInput = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerInput = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.widgets.booking.tables);
    thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(select.containerOf.floor);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.submit = thisBooking.dom.wrapper.querySelector(select.booking.submit);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePickerInput); 
    thisBooking.hourPickerElem = new HourPicker(thisBooking.dom.hourPickerInput);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){});

    thisBooking.dom.datePickerInput.addEventListener('updated', function() {
      thisBooking.selectedTable = '';
      const activeTable = thisBooking.dom.floor.querySelector(select.booking.tableSelected);
      if (activeTable) activeTable.classList.remove(classNames.booking.tableSelected);
    });

    thisBooking.dom.hourPickerInput.addEventListener('updated', function() {
      thisBooking.selectedTable = '';
      const activeTable = thisBooking.dom.floor.querySelector(select.booking.tableSelected);
      if (activeTable) activeTable.classList.remove(classNames.booking.tableSelected);
    });

    console.log(thisBooking.dom);
    thisBooking.dom.floor.addEventListener('click', function(event){
      if (event.target.classList.contains('table')) {
        thisBooking.initTables(event.target);
      }
    });

  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.booking + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectTableId,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    }

    for(let start of thisBooking.starters){
      payload.products.push(start.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

      fetch(url, options)
        .then(function (response){
          return response.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse:', parsedResponse);
        });
      this.sendBooking();
  }

  initActions() {
    const thisBooking = this;
    thisBooking.dom.submit.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }
}

export default Booking;
