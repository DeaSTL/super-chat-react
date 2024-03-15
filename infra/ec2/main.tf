
resource "aws_vpc" "super-chat-vpc" {
    cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "super-chat-subnet" {
    vpc_id            = aws_vpc.super-chat-vpc.id
    availability_zone = "us-east-1a"
    cidr_block = "10.0.0.0/16"
    map_public_ip_on_launch = true
}

resource "aws_security_group" "super-chat-sg" {
  name = "super-chat-sg"
  description = "Allow 8080,443,80"

  ingress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 8080
    to_port = 8080
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    name = "super-chat-sg"
  }
}

resource "aws_key_pair" "super_chat" {
  key_name = "super-chat-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

resource "aws_instance" "super-chat-instance" {
  ami = var.ami
  instance_type = "t2.micro"
  key_name = aws_key_pair.super_chat.key_name
  tags = {
    Name = var.name
  }
  security_groups = [aws_security_group.super-chat-sg.name]

  user_data = templatefile("${path.module}/cloud-init.yaml",{ssh_key:"${aws_key_pair.super_chat.public_key}"})

}
