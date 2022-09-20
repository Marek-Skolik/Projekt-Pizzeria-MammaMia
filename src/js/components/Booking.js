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
    thisBooking.initTables();
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

  initTables(event) {
    const clickedElement = event;
    const thisBooking = this;
    thisBooking.selectedTable = '';
    

    if (clickedElement.classList.contains('table')) {
      if (clickedElement.classList.contains(classNames.booking.tableBooked)) {
        alert('This table is booked');
        return;
      }
      if (!clickedElement.classList.contains(classNames.booking.tableSelected)) {
        for (let table of thisBooking.dom.tables) {
          table.classList.remove(classNames.booking.tableSelected);

          thisBooking.selectedTable = '';

          clickedElement.classList.add(classNames.booking.tableSelected);

          const selectedTableId = clickedElement.getAttribute('data-table');

          thisBooking.selectedTable += selectedTableId;
          console.log(thisBooking.selectedTable);
        }
      } else {

        thisBooking.selectedTable = clickedElement.getAttribute('data-table');

        clickedElement.classList.remove(classNames.booking.tableSelected);

        thisBooking.selectedTable = '';
      }
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
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePickerInput); 
    thisBooking.hourPickerElem = new HourPicker(thisBooking.dom.hourPickerInput);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('updated', function(){});

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('updated', function(){});

    thisBooking.dom.floor.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });

  }
}

export default Booking;
