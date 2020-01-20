import React, { useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import General from "./General";
import Artist from "./Artist";
import Ticket from "./Ticket";
import Rider from "./Rider";
import EventService from "../../service/events";
import UserService from "../../service/users";
import RiderTypeService from "../../service/rider_types";
import FileService from "../../service/files";
import EventTypeService from "../../service/event_types";
import ContractService from "../../service/contracts";
import RiderService from "../../service/riders";
import TicketService from "../../service/tickets";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    backButton: {
      marginRight: theme.spacing(1)
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1)
    }
  })
);

function getSteps() {
  return ["General", "Artist(s)", "Tickets", "Rider"];
}

function getStepContent(
  stepIndex: number,
  values: any,
  handleChange: any,
  eventTypes: any,
  riderTypes: any
) {
  switch (stepIndex) {
    case 0:
      return (
        <General
          values={values}
          handleChange={handleChange}
          eventTypes={eventTypes}
        />
      );
    case 1:
      return <Artist values={values} handleChange={handleChange} />;
    case 2:
      return <Ticket tickets={values.tickets} handleChange={handleChange} />;
    case 3:
      return (
        <Rider
          values={values}
          handleChange={handleChange}
          riderTypes={riderTypes}
        />
      );
    default:
      return "Unknown stepIndex";
  }
}

interface Values {
  name: string;
  description: string;
  location: string;
  timeStart: Date;
  timeEnd: Date;
  dateStart: Date;
  dateEnd: Date;
  personnel: string;
  eventImage: any;
  eventTypeId: number;
  artists: Array<{
    id: number;
    name: string;
    email: string;
    checked: boolean;
    contractFile: any;
  }>;
  riders: Array<{ additions: string; rider_typeID: number; userID: number }>;
  tickets: Array<{
    id: number;
    ticket_name: string;
    price: number;
    ticket_amount: number;
    date_start: Object;
    date_end: Object;
  }>;
}

export default (props: any) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  // States for posting event
  const [eventTypes, setEventTypes] = useState([]);
  const [renderGeneral, setRenderGeneral] = useState(false);
  const [riderTypes, setRiderTypes] = useState([]);
  const [initialArtists, setInitialArtists] = useState([]);
  const [values, setValues] = useState<Values>({
    name: "",
    description: "",
    location: "",
    timeStart: new Date(),
    timeEnd: new Date(),
    dateStart: new Date(),
    dateEnd: new Date(),
    personnel: "",
    eventImage: new File(["foo"], ""),
    eventTypeId: 0,
    artists: [],
    riders: [],
    tickets: []
  });

  useEffect(() => {
    EventTypeService.getEvent_Types().then((eventTypes: any) => {
      setEventTypes(eventTypes);
    });
    RiderTypeService.getRider_Types().then((riderTypes: any) => {
      setRiderTypes(riderTypes);
    });
    UserService.getArtist().then(response => {
      response.map((artist: any) => {
        values.artists.push({
          id: artist.id,
          name: artist.username,
          email: artist.email,
          checked: false,
          contractFile: null
        });
      });
      if (props.edit) {
        EventService.getContractsByEvent(props.match.params.id).then(
          (previousArtists: any) => {
            let initialArtists: any = [];
            previousArtists.map((contract: any) => {
              values.artists.map(artist => {
                if (contract.userID === artist.id) {
                  artist.checked = true;
                  initialArtists.push(artist);
                }
              });
            });
            setInitialArtists(initialArtists);
          }
        );
        TicketService.getEventTickets(props.match.params.id).then(
          (tickets: any) => {
            setValues({
              ...values,
              tickets: tickets
            });
          }
        );
      }
    });
  }, []);

  useEffect(() => {
    if (props.edit) {
      RiderService.getEventRiders(props.match.params.id).then((riders: any) => {
        setValues({
          ...values,
          riders: riders
        });
        setRenderGeneral(!renderGeneral);
      });
    }
  }, [initialArtists]);

  useEffect(() => {
    if (props.edit) {
      EventService.getEvent(props.match.params.id).then((response: any) => {
        setValues({
          ...values,
          name: response.event_name,
          description: response.description,
          location: response.location,
          timeStart: response.event_start,
          timeEnd: response.event_end,
          dateStart: response.event_start,
          dateEnd: response.event_end,
          personnel: response.personnel,
          eventTypeId: response.event_typeID,
          eventImage: new File(["foo"], "")
        });
      });
    }
  }, [renderGeneral]);

  const handleChange = (event: any, name: string = "") => {
    if (name === "") {
      const { name, value } = event.target;
      setValues({ ...values, [name]: value });
    } else {
      setValues(values => ({ ...values, [name]: event }));
    }
  };

  const submit = () => {
    let dateStart = String(values.dateStart).substring(0, 10);
    let dateEnd = String(values.dateEnd).substring(0, 10);
    let timeStart = String(values.timeStart).substring(11, 19);
    let timeEnd = String(values.timeEnd).substring(11, 19);
    let artists: number[] = [];
    values.artists
      .filter(artist => artist.checked === true)
      .map(artist => {
        artists.push(artist.id);
      });
    let riders: Array<{
      rider_typeID: number;
      userID: number;
      additions: string;
    }> = [];
    values.riders.map(rider => {
      if (artists.includes(rider.userID)) {
        riders.push(rider);
      }
    });
    let event = {
      event_name: values.name,
      location: values.location,
      event_start: dateStart + " " + timeStart,
      event_end: dateEnd + " " + timeEnd,
      personnel: values.personnel,
      description: values.description,
      event_typeID: values.eventTypeId,
      artists: artists,
      riders: riders,
      tickets: values.tickets
    };
    if (!props.edit) {
      EventService.postEvent(event)
        .then((response: any) => {
          if (values.eventImage.name !== "") {
            FileService.postEventPicture(values.eventImage, response.id)
              .then(() => null)
              .catch((err: any) => console.log(err));
          }
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
      EventService.updateEvent(
        {
          event_name: values.name,
          location: values.location,
          event_start: dateStart + " " + timeStart,
          event_end: dateEnd + " " + timeEnd,
          personnel: values.personnel,
          description: values.description,
          event_typeID: values.eventTypeId
        },
        props.match.params.id
      )
        .then((response: any) => {
          FileService.postEventPicture(values.eventImage, props.match.params.id)
            .then(() => null)
            .catch((err: any) => console.log(err));
        })
        .catch((error: any) => {
          console.log(error);
        });
      values.tickets.map(ticket => {
        TicketService.updateTicket(ticket, ticket.id);
      });
      RiderService.deleteRider(props.match.params.id)
        .then((response: any) => {
          values.riders.map((rider: any) => {
            RiderService.postRider({
              ...rider,
              eventID: props.match.params.id
            }).then((response: any) => {});
          });
        })
        .catch((err: any) => console.log(err));
      initialArtists.map((initArtist: any) => {
        let artistObj = values.artists.find(
          (artist: any) => artist.id === initArtist.id
        );
        if (artistObj !== undefined) {
          let checked = artistObj.checked;
          if (!checked) {
            ContractService.deleteContract(
              initArtist.id,
              props.match.params.id
            ).then((resp: any) => console.log(resp));
          }
        }
      });
      values.artists.map((artist: any) => {
        let initArtist = initialArtists.find(
          (initArtist: any) => initArtist.id === artist.id
        );
        if (initArtist === undefined && artist.checked) {
          ContractService.postContract({
            contract: null,
            userID: artist.id,
            eventID: props.match.params.id
          });
        }
      });
    }
  };

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed
            </Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <Typography className={classes.instructions}>
              {getStepContent(
                activeStep,
                values,
                handleChange,
                eventTypes,
                riderTypes
              )}
            </Typography>
            <div>
              <Grid container justify="center">
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className={classes.backButton}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={
                    activeStep === steps.length - 1 ? submit : handleNext
                  }
                >
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>
              </Grid>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
