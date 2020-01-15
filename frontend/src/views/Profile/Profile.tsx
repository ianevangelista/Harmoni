import React, {useState, useEffect} from "react";
import Card from "../../components/Card/Card";
import Button from "../../components/Button/Button";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {createStyles, makeStyles, Theme} from "@material-ui/core/styles";
import Link from '@material-ui/core/Link';
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper} from "@material-ui/core";
import InputField from "../../components/InputField/InputField";
import UserService from "../../service/users";
import RoleService from "../../service/roles";
import getCookie from "../../service/cookie"


const useStyles = makeStyles((theme: Theme) => createStyles ({
    title: {
        fontSize: "24px",
        padding: "20px",
    },
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'left',
        color: theme.palette.text.secondary,
        width: '500px'
    }
}));

export default (props: any) => {
    const classes = useStyles();
    const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openChangePass, setOpenChangePass] = React.useState(false);
    const [openEditPic, setOpenEditPic] = React.useState(false);

    const [newValues, setNewValues] = useState({
        fullName: "hei",
        email: "email",
        telephone: "telephone",
        picture: ""
    });
    const [values, setValues] = useState({
        id: 0,
        fullName: "hei",
        roleID: 0,
        role: "role",
        email: "email",
        telephone: "telephone",
        picture: ""
    });
    const handleChange = (event: any) => {
        const { name, value } = event.target;
        setNewValues({ ...newValues, [name]: value });
        console.log(event.target.name);
        console.log(event.target.value);
    };

    const handleSubmit = (event: any) => {
        //event.preventDefault();
        console.log("submitted")
    };

    const handleSubmitData = (event: any) => {
        console.log("submitted")
        setValues({fullName: newValues.fullName, email: newValues.email, telephone: newValues.telephone, id: values.id, roleID: values.roleID, role:values.role, picture: values.picture})
        UserService.updateOneUser(values.id, {username: newValues.fullName, email: newValues.email, phone: newValues.telephone, picture: newValues.picture})
        .then(res => console.log(res))
        setOpenEdit(false);
    };

    const fileSelectedHandler = (event: any) => {
        event.preventDefault();
        console.log(event.target.files[0]);
    };

    const resetNewVal = () => {
        setNewValues({
            fullName:values.fullName,
            email:values.email,
            telephone:values.telephone,
            picture:values.picture
        })
    };

    const handleOpenEdit = () => {
        setOpenEdit(true);
    };

    const handleCloseEdit = () => {
        setOpenEdit(false);
        resetNewVal();
    };

    const handleOpenChangePass = () => {
        setOpenChangePass(true);
    };

    const handleCloseChangePass = () => {
        setOpenChangePass(false);
    };

    const handleOpenEditPic = () => {
        setOpenEditPic(true);
    };

    const handleCloseEditPic = () => {
        setOpenEditPic(false);
    };

    useEffect(() => {
        // Update the document title using the browser API
        UserService.getOneUser()
        .then(res => {
            RoleService.getRole(res.roleID)
            .then((res1: any) => {
                 setValues({
                    id:res.id,
                    roleID: res.roleID,
                    fullName:res.username,
                    email:res.email,
                    telephone:res.phone,
                    role:res1.role_name,
                    picture:res.picture
                })
                setNewValues({
                    fullName:res.username,
                    email:res.email,
                    telephone:res.phone,
                    picture:res.picture
                })
            })
        })
      },[]);

    return (
        <Card width={"100%"} style={{ minWidth: "500px", maxWidth: "800px" }}>
            <div>
                <Grid container direction="row">
                    <Typography className={classes.title} variant="h3" align="left">
                        Profile
                    </Typography>
                </Grid>
            </div>
            <CardContent>
                <div style={{marginBottom: '30px'}}>
                    <Grid container spacing={4}>
                        <Grid item xs={3}>
                            <img style={{width: '160px', height: '160px'}} src={"http://localhost:8080/profile_picture/"+values.id} alt={values.picture}/>
                            <Typography>
                                <Link  href="#" onClick={handleOpenEditPic} color="inherit" style={{fontSize: '12px'}}>
                                    {'Edit profile picture'}
                                </Link>
                            </Typography>
                            <Dialog open={openEditPic} onClose={handleCloseEditPic} aria-labelledby="form-dialog-title" style={{width: '100%'}}>
                                <DialogTitle id="form-dialog-title">
                                    Edit Profile Picture
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText></DialogContentText>
                                    <Paper className={classes.paper}>
                                        <Button
                                            variant="contained"
                                            component="label"
                                        >
                                            Choose File
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: "none" }}
                                                onChange={fileSelectedHandler}
                                            />
                                        </Button>
                                    </Paper>
                                </DialogContent>
                                <DialogActions>
                                    <Grid container direction="row" justify="center">
                                        <Grid item xs={3}>
                                            <Button
                                                type="submit"
                                                conClick={handleSubmit}>
                                                Upload Image
                                            </Button>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Button onClick={handleCloseEditPic} color="primary">
                                                Cancel
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </DialogActions>
                            </Dialog>
                        </Grid>
                        <Grid item xs={3}>
                            <p >{values.fullName}</p>
                            <p >{values.role}</p>
                            <p >{values.email}</p>
                            <p >{values.telephone}</p>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <Grid container direction="row" justify="center">
                        <Grid item xs={3}>
                            <Button onClick={handleOpenEdit}>
                                Edit
                            </Button>
                            <Dialog open={openEdit} onClose={handleCloseEdit} aria-labelledby="form-dialog-title" style={{width: '100%'}}>
                                <DialogTitle id="form-dialog-title">
                                    Edit Profile
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText></DialogContentText>
                                    <InputField
                                            autoFocus
                                            name="fullName"
                                            label="Name"
                                            type="text"
                                            value={newValues.fullName}
                                            onChange={handleChange}
                                            />
                                        <InputField
                                            autoFocus
                                            name="email"
                                            label="Email"
                                            type="text"
                                            value={newValues.email}
                                            onChange={handleChange}
                                            />
                                        <InputField
                                            autoFocus
                                            name="telephone"
                                            label="Telephone"
                                            type="text"
                                            value={newValues.telephone}
                                            onChange={handleChange}
                                        />
                                </DialogContent>
                                <DialogActions>
                                    <Grid container direction="row" justify="center">
                                        <Grid item xs={3}>
                                            <Button onClick={handleSubmitData} color="primary">
                                                Save Profile
                                            </Button>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Button onClick={handleCloseEdit} color="primary">
                                                Cancel
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </DialogActions>
                            </Dialog>
                        </Grid>
                        <Grid item xs={3}>
                            <Button onClick={handleOpenChangePass}>
                                Change Password
                            </Button>
                            <Dialog open={openChangePass} onClose={handleCloseChangePass} aria-labelledby="form-dialog-title" style={{width: '100%'}}>
                                <DialogTitle id="form-dialog-title">
                                    Change PassWord
                                </DialogTitle>
                                <DialogContent>
                                    <DialogContentText></DialogContentText>
                                    <InputField
                                        autoFocus
                                        name="oldPassword"
                                        label="Old Password"
                                        type="text"
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        autoFocus
                                        name="newPassword"
                                        label="New Password"
                                        type="text"
                                        onChange={handleChange}
                                    />
                                    <InputField
                                        autoFocus
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type="text"
                                        onChange={handleChange}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Grid container direction="row" justify="center">
                                        <Grid item xs={3}>
                                            <Button onClick={handleSubmit} color="primary">
                                                Change
                                            </Button>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Button onClick={handleCloseChangePass} color="primary">
                                                Cancel
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </DialogActions>
                            </Dialog>
                        </Grid>
                        <Grid item xs={3}>
                            <Button onClick={()=> {
                                document.cookie = "token="+getCookie("token")+"; expires="+new Date().toUTCString();
                                window.location.hash="/"
                            }}>
                                Logout
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </CardContent>
        </Card>
    );
};
