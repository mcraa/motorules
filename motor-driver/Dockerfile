FROM balenalib/armv7hf-debian

WORKDIR /usr/src/app

RUN apt update
RUN apt install python3-pip
RUN apt install python3-rpi.gpio
RUN python3 -m pip install adafruit-circuitpython-motorkit
RUN python3 -m pip install falcon
RUN python3 -m pip install requests
RUN python3 -m pip install gunicorn

COPY . .

CMD ["gunicorn", "-b :8070", "motor:app"]