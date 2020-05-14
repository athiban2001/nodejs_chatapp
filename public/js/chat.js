const socket=io();

const $messageForm=document.querySelector('#sendMessage');
const $messageFormInput=document.querySelector('#message');
const $messageFormButton=document.querySelector('#send');
const $shareLocationButton=document.querySelector('#shareLocation');
const $messages=document.querySelector('#messages');

const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationTemplate=document.querySelector('#location-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

const{username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    console.log(scrollOffset);
    console.log(containerHeight - newMessageHeight);
    console.log(containerHeight - newMessageHeight <= scrollOffset);
    if (containerHeight - newMessageHeight <= scrollOffset+5) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}


socket.on('message',(message)=>{
    console.log(message);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationMessage',(locationMessage)=>{
    console.log(locationMessage);
    const html=Mustache.render(locationTemplate,{
        username:locationMessage.username,
        url:locationMessage.url,
        createdAt:moment(locationMessage.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('roomData',({users,room})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    console.log(users);
    document.querySelector('.chat__sidebar').innerHTML=html;
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const message=$messageFormInput.value;

    $messageFormButton.setAttribute('disabled','disabled');

    socket.emit('sendMessage',message,(error)=>{

        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();

        if(error){
            return console.log(error);
        }
        console.log('Message Delivered Successfully');
    });
})

$shareLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Your Website does not support sending your location');
    }

    $shareLocationButton.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $shareLocationButton.removeAttribute('disabled');
            console.log('Location Shared');
        });
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href='/';
    }
});