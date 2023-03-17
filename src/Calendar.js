import { useState, useRef, useEffect } from 'react';

import { getDateAccordingToMonth, shallowClone, getValueType } from './shared/generalUtils';
import { TYPE_SINGLE_DATE, TYPE_RANGE, TYPE_MUTLI_DATE } from './shared/constants';
import { useLocaleUtils, useLocaleLanguage } from './shared/hooks';

import { Header, MonthSelector, YearSelector, DaysList } from './components';

const Calendar = ({
  value,
  onChange,
  onDisabledDayError,
  calendarClassName,
  calendarTodayClassName,
  calendarSelectedDayClassName,
  calendarRangeStartClassName,
  calendarRangeBetweenClassName,
  calendarRangeEndClassName,
  disabledDays,
  bookedDays,
  pendingDays,
  colorPrimary,
  colorPrimaryLight,
  slideAnimationDuration,
  minimumDate,
  maximumDate,
  selectorStartingYear,
  selectorEndingYear,
  locale,
  shouldHighlightWeekends,
  renderFooter,
  customDaysClassName,
  onChangeMonth = () => {},
  handleOnChange = () => {},
}) => {
  const calendarElement = useRef(null);
  const [mainState, setMainState] = useState({
    activeDate: null,
    monthChangeDirection: '',
    isMonthSelectorOpen: false,
    isYearSelectorOpen: false,
  });

  useEffect(() => {
    const handleKeyUp = ({ key }) => {
      /* istanbul ignore else */
      if (key === 'Tab') calendarElement.current.classList.remove('-noFocusOutline');
    };
    calendarElement.current.addEventListener('keyup', handleKeyUp, false);
    return () => {
      calendarElement.current.removeEventListener('keyup', handleKeyUp, false);
    };
  });

  const { getToday } = useLocaleUtils(locale);
  const { weekDays: weekDaysList, isRtl } = useLocaleLanguage(locale);
  const today = getToday();

  const createStateToggler = property => () => {
    setMainState({ ...mainState, [property]: !mainState[property] });
  };

  const toggleMonthSelector = createStateToggler('isMonthSelectorOpen');
  const toggleYearSelector = createStateToggler('isYearSelectorOpen');

  const getComputedActiveDate = () => {
    const valueType = getValueType(value);
    if (valueType === TYPE_MUTLI_DATE && value.length) return shallowClone(value[0]);
    if (valueType === TYPE_SINGLE_DATE && value) return shallowClone(value);
    if (valueType === TYPE_RANGE && value.from) return shallowClone(value.from);
    return shallowClone(today);
  };

  const activeDate = mainState.activeDate
    ? shallowClone(mainState.activeDate)
    : getComputedActiveDate();

  const weekdays = weekDaysList.map(weekDay => (
    <abbr key={weekDay.name} title={weekDay.name} className="Calendar__weekDay">
      {weekDay.short}
    </abbr>
  ));

  const handleMonthChange = direction => {
    setMainState({
      ...mainState,
      monthChangeDirection: direction,
    });

    if (direction === 'NEXT') {
      const month = activeDate.month === 12 ? 1 : activeDate.month + 1;
      const year = activeDate.month === 12 ? activeDate.year + 1 : activeDate.year;

      handleOnChange({ ...activeDate, month, year });
    }

    if (direction === 'PREVIOUS') {
      const month = activeDate.month === 1 ? 12 : activeDate.month - 1;
      const year = activeDate.month === 1 ? activeDate.year - 1 : activeDate.year;

      handleOnChange({ ...activeDate, month, year });
    }
  };

  const updateDate = () => {
    setMainState({
      ...mainState,
      activeDate: getDateAccordingToMonth(activeDate, mainState.monthChangeDirection),
      monthChangeDirection: '',
    });
  };

  const selectMonth = newMonthNumber => {
    setMainState({
      ...mainState,
      activeDate: { ...activeDate, month: newMonthNumber },
      isMonthSelectorOpen: false,
    });
    handleOnChange({ ...activeDate, month: newMonthNumber });
  };

  const selectYear = newYearNumber => {
    setMainState({
      ...mainState,
      activeDate: { ...activeDate, year: newYearNumber },
      isYearSelectorOpen: false,
    });
    handleOnChange({ ...activeDate, year: newYearNumber });
  };

  return (
    <div
      className={`Calendar -noFocusOutline ${calendarClassName} -${isRtl ? 'rtl' : 'ltr'}`}
      role="grid"
      style={{
        '--cl-color-primary': colorPrimary,
        '--cl-color-primary-light': colorPrimaryLight,
        '--animation-duration': slideAnimationDuration,
      }}
      ref={calendarElement}
    >
      <Header
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        activeDate={activeDate}
        onMonthChange={handleMonthChange}
        onMonthSelect={toggleMonthSelector}
        onYearSelect={toggleYearSelector}
        monthChangeDirection={mainState.monthChangeDirection}
        isMonthSelectorOpen={mainState.isMonthSelectorOpen}
        isYearSelectorOpen={mainState.isYearSelectorOpen}
        locale={locale}
        onChangeMonth={onChangeMonth}
      />

      <MonthSelector
        isOpen={mainState.isMonthSelectorOpen}
        activeDate={activeDate}
        onMonthSelect={selectMonth}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        locale={locale}
      />

      <YearSelector
        isOpen={mainState.isYearSelectorOpen}
        activeDate={activeDate}
        onYearSelect={selectYear}
        selectorStartingYear={selectorStartingYear}
        selectorEndingYear={selectorEndingYear}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        locale={locale}
      />

      <div className="Calendar__weekDays">{weekdays}</div>

      <DaysList
        activeDate={activeDate}
        value={value}
        monthChangeDirection={mainState.monthChangeDirection}
        onSlideChange={updateDate}
        disabledDays={disabledDays}
        bookedDays={bookedDays}
        pendingDays={pendingDays}
        onDisabledDayError={onDisabledDayError}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={onChange}
        calendarTodayClassName={calendarTodayClassName}
        calendarSelectedDayClassName={calendarSelectedDayClassName}
        calendarRangeStartClassName={calendarRangeStartClassName}
        calendarRangeEndClassName={calendarRangeEndClassName}
        calendarRangeBetweenClassName={calendarRangeBetweenClassName}
        locale={locale}
        shouldHighlightWeekends={shouldHighlightWeekends}
        customDaysClassName={customDaysClassName}
        isQuickSelectorOpen={mainState.isYearSelectorOpen || mainState.isMonthSelectorOpen}
      />
      <div className="Calendar__footer">{renderFooter()}</div>
    </div>
  );
};

Calendar.defaultProps = {
  minimumDate: null,
  maximumDate: null,
  colorPrimary: 'rgba(0, 0, 0, 0.87)',
  colorPrimaryLight: '#e0e0e0',
  slideAnimationDuration: '0.4s',
  calendarClassName: '',
  locale: 'en',
  value: null,
  renderFooter: () => null,
  customDaysClassName: [],
};

export { Calendar };
