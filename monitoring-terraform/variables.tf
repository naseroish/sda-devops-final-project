variable "existing_rg_name" {
  type = string
}

variable "existing_workspace_name" {
  type = string
}

variable "location" {
  type    = string
  default = "UK West"
}

variable "prefix" {
  type    = string
  default = "final-cometops"
}
