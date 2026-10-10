import type { StringTemplate } from "../utils/strings";

export type UseWcStrings = {
  "use-date-input"?: {
    /** Default: "year" */
    year?: StringTemplate;
    /** Default: "month" */
    month?: StringTemplate;
    /** Default: "day" */
    day?: StringTemplate;
  };
  "use-duration-input"?: {
    /** Default: "years" */
    year?: StringTemplate;
    /** Default: "months" */
    month?: StringTemplate;
    /** Default: "days" */
    day?: StringTemplate;
    /** Default: "hours" */
    hour?: StringTemplate;
    /** Default: "minutes" */
    minute?: StringTemplate;
    /** Default: "seconds" */
    second?: StringTemplate;
    /** Default: "milliseconds" */
    millisecond?: StringTemplate;
  };
  "use-grid"?: {
    /** Default: "Select all rows" */
    selectAllRows?: StringTemplate;
    /** Default: "Select {label}" */
    selectRow?: StringTemplate;
    /** Default: "Select row {index}" */
    selectRowNumber?: StringTemplate;
  };
  "use-time-input"?: {
    /** Default: "hours" */
    hour?: StringTemplate;
    /** Default: "minutes" */
    minute?: StringTemplate;
    /** Default: "seconds" */
    second?: StringTemplate;
    /** Default: "milliseconds" */
    millisecond?: StringTemplate;
    /** Default: "AM/PM" */
    dayPeriod?: StringTemplate;
    /** Default: "AM" */
    am?: StringTemplate;
    /** Default: "PM" */
    pm?: StringTemplate;
  };
};
