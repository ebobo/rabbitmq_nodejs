# start a rebbitmq container

docker run --name rebbitmq-1 -p 5672:5672 rabbitmq

# start a rabbitmq with Management Plugin

# the standard management port of 15672, with the default username and password of guest / guest:

docker run -d --hostname my-rabbit --name rabbitmq-1 -p 15672:15672 -p 5672:5672 rabbitmq:3-management
